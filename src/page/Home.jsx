import React, { useState, useRef } from 'react';
import { Carousel } from 'antd';


const contentStyle = {
  margin: 0,
  height: '80vh',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};



const Home = () => {
  const [touchControl, setTouchControl] = useState(0);
  const carouselRef = useRef();

  const handleTouchStart = (e) => {
    setTouchControl(e.changedTouches[0].clientY)
  }

  const handleTouchMove = (e) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (touchControl - touchEnd > 200) {
      carouselRef.current.next()
    } else {
      if (touchControl - touchEnd < -200) {
        carouselRef.current.prev()
      }
    }
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
    <Carousel ref={carouselRef} arrows dotPosition="left" infinite={true}>
      <div>
        <h3 style={contentStyle}>터치 커스텀 실험용임</h3>
      </div>
      <div>
        <h3 style={contentStyle}>2</h3>
      </div>
      <div>
        <h3 style={contentStyle}>3</h3>
      </div>
      <div>
        <h3 style={contentStyle}>4</h3>
      </div>
    </Carousel>
  </div>
  );
};

export default Home;