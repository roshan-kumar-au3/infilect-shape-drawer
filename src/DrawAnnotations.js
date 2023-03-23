import React from "react";
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { nanoid } from 'nanoid';

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        x={shapeProps.x1}
        y={shapeProps.y1}
        width={shapeProps.width}
        height={shapeProps.height}
        fill="transparent"
        stroke={isSelected ? 'red' : 'yellow'}
        // draggable
        // onDragEnd={(e) => {
        //   onChange({
        //     ...shapeProps,
        //     x: e.target.x(),
        //     y: e.target.y(),
        //   });
        // }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const DrawAnnotations = ({annotations, setAnnotations, newAnnotation, setNewAnnotation, currentImage, selectShape, selectedId, checkDeselect}) => {

  const handleMouseDown = event => {
    // deselect when clicked on empty area
    checkDeselect(event);
    if (newAnnotation.length === 0 && selectedId === null) {
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([{ x1: x, y1: y, width: 0, height: 0, key: nanoid(), imgId: currentImage.id, boxId: nanoid() }]);
    }
  };

  const handleMouseUp = event => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x1;
      const sy = newAnnotation[0].y1;
      const { x, y } = event.target.getStage().getPointerPosition();
      const annotationToAdd = {
        x1: sx,
        y1: sy,
        x2: x,
        y2: y,
        width: x - sx,
        height: y - sy,
        key: nanoid(),
        imgId: currentImage.id,
        boxId: nanoid(),
      };

      if (annotations.length > 0) {
          setAnnotations([...annotations, annotationToAdd]); 
      } else {
        setAnnotations([annotationToAdd]);
      }
      setNewAnnotation([]);
    }
  };

  const handleMouseMove = event => {
    if (newAnnotation.length === 1) {
      const sx = newAnnotation[0].x1;
      const sy = newAnnotation[0].y1;
      const { x, y } = event.target.getStage().getPointerPosition();
      setNewAnnotation([
        {
            x1: sx,
            y1: sy,
            x2: x,
            y2: y,
            width: x - sx,
            height: y - sy,
            key: nanoid(),
            imgId: currentImage.id,
            boxId: nanoid()
        }
      ]);
    }
  };

  const annotationsToDraw = annotations.length ? [...annotations, ...newAnnotation]: [...newAnnotation];

  return (
    <Stage
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      width={600}
      height={400}
      style={{ border: "5px solid green", width: "100%", height: "100%" }}
    >
      <Layer>
        {annotationsToDraw.map((value, i) => {
          return (
            <Rectangle
              key={i}
              shapeProps={value}
              isSelected={value.boxId === selectedId}
              onSelect={() => {
                selectShape(value.boxId);
              }}
              onChange={(newAttrs) => {
                const rects = annotationsToDraw.slice();
                rects[i] = newAttrs;
                setAnnotations(rects);
              }}
            />
            // <Rect
            //   key={value.key}
            //   x={value.x1}
            //   y={value.y1}
            //   isS
            //   width={value.width}
            //   height={value.height}
            //   fill="transparent"
            //   stroke="yellow"
            // />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default DrawAnnotations;