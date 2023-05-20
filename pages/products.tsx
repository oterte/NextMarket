// import ImageGallery from 'react-image-gallery';

import Image from "next/image";
import Carousel from "nuka-carousel";
const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1016/1000/600/",
    thumbnail: "https://picsum.photos/id/1016/250/150/",
  },
  {
    original: "https://picsum.photos/id/1014/1000/600/",
    thumbnail: "https://picsum.photos/id/1014/250/150/",
  },
  {
    original: "https://picsum.photos/id/1013/1000/600/",
    thumbnail: "https://picsum.photos/id/1013/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

function products() {
  return (
    // <ImageGallery items={images}/>
    <Carousel animation="fade" autoplay withoutControls={true} wrapAround>
      {images.map((item) => (
        <Image
          key={item.original}
          src={item.original}
          alt="이미지"
          width={1000}
          height={600}
          layout="responsive"
        />
      ))}
    </Carousel>
  );
}

export default products;
