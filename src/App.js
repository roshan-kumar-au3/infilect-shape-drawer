import React, { useState, useEffect } from 'react';
import './App.css';
import infilectImgTwo from './assets/infilect-image-2.jpeg';
import infilectImgThree from './assets/infilect-image-3.jpeg';
import infilectImgFour from './assets/infilect-image-4.jpeg';
import infilectImgFive from './assets/infilect-image-5.jpeg';
import DrawAnnotations from './DrawAnnotations';

const images = [
  { id: 1, src: infilectImgTwo },
  { id: 2, src: infilectImgThree },
  { id: 3, src: infilectImgFour },
  { id: 4, src: infilectImgFive }
];


function App() {
  const [currentIndex, setCurrentIndex] = useState(JSON.parse(localStorage.getItem('activeIndex')) || 0);
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectedId, selectShape] = React.useState(null);

  const handleKeyDown = (event) => {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
        console.log('btn pressed -> delete || backspace');
        const annotationsSaved = JSON.parse(localStorage.getItem('annotations')) ?? [];
        console.log(annotationsSaved, selectedId, 'annotationsSaved, selectedId');
        if (annotationsSaved.length > 0) {
          const annotationsWithoutSelectedBox = annotationsSaved.filter(annotation => annotation.boxId !== selectedId);
          const annotationsForCurrentImageWithoutSelected = annotationsWithoutSelectedBox.filter(annotation => annotation.imgId !== images[currentIndex].id);
          setAnnotations(annotationsForCurrentImageWithoutSelected);
          localStorage.setItem('annotations', JSON.stringify(annotationsWithoutSelectedBox));
          window.location.reload();
        }
    }
  }

  useEffect(() => {
    const annotationsSaved = JSON.parse(localStorage.getItem('annotations')) ?? [];
    localStorage.setItem('activeIndex', JSON.stringify(currentIndex));
    const annotationsForCurrentImage = annotationsSaved.length && annotationsSaved.filter(annotation => annotation.imgId === images[currentIndex].id);
    setAnnotations(annotationsForCurrentImage);
  }, [currentIndex]);

  useEffect(() => {
    const annotationsSaved = JSON.parse(localStorage.getItem('annotations')) ?? [];
    const annotationsForCurrentImage = annotationsSaved.length && annotationsSaved.filter(annotation => annotation.imgId === images[currentIndex].id);
    setAnnotations(annotationsForCurrentImage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedId]);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };
  


  const handleNext = () => {
    if (currentIndex === images.length - 1) {
      setCurrentIndex(0);
      console.log(annotations);
      setAnnotations([]);
    } else {
      setCurrentIndex(currentIndex + 1);
      console.log(annotations);
      setAnnotations([]);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      setCurrentIndex(images.length - 1);
      console.log(annotations);
      setAnnotations([]);
    } else {
      setCurrentIndex(currentIndex - 1);
      console.log(annotations);
      setAnnotations([]);
    }
  };
  
  

  const save = () => {
    let annotationsSaved = JSON.parse(localStorage.getItem('annotations')) || [];
    localStorage.setItem('annotations', JSON.stringify([...annotations, ...annotationsSaved]));
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', height: '600px'}}>
      <div style={{ width: '600px', height: '400px'}}>
          <img src={images[currentIndex].src} alt="infilect" style={{ position: 'absolute', objectFit: 'cover', width: '600px', height: '400px', zIndex: '-1'  }} />
          <DrawAnnotations annotations={annotations} setAnnotations={setAnnotations} newAnnotation={newAnnotation} setNewAnnotation={setNewAnnotation} currentImage={images[currentIndex]} selectShape={selectShape} selectedId={selectedId}
           checkDeselect={checkDeselect} />
      </div>
    </div>
    <div style={{ marginTop: '10px' , display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', zIndex: '99'}}>
      <button onClick={handlePrev} style={{ width: '60px', height: '40px' }}>Prev</button>
      <button style={{width: '60px', height: '40px'}} onClick={save}>Save</button>
      <button onClick={handleNext} style={{ width: '60px', height: '40px' }}>Next</button>
    </div>
    </>
  );
}

export default App;
