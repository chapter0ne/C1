import React, { useRef } from "react";
import HTMLFlipBook from "react-pageflip";

const PageFlipBook = ({ pages, onPageChange, width = 400, height = 600, theme, fontSize, fontFamily }) => {
  const bookRef = useRef();

  return (
    <HTMLFlipBook
      width={width}
      height={height}
      size="stretch"
      minWidth={315}
      maxWidth={1000}
      minHeight={400}
      maxHeight={1536}
      maxShadowOpacity={0.5}
      showCover={false}
      mobileScrollSupport={true}
      startPage={0}
      drawShadow={true}
      flippingTime={600}
      usePortrait={true}
      startZIndex={0}
      autoSize={true}
      clickEventForward={true}
      useMouseEvents={true}
      swipeDistance={30}
      showPageCorners={true}
      disableFlipByClick={false}
      onFlip={e => onPageChange && onPageChange(e.data)}
      ref={bookRef}
      className="mx-auto shadow-lg"
      style={{ background: theme?.background, color: theme?.text }}
    >
      {pages.map((content, idx) => (
        <div key={idx} className="page bg-white p-6" style={{ fontSize, fontFamily }}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ))}
    </HTMLFlipBook>
  );
};

export default PageFlipBook;
