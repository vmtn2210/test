import { useRef } from "react"
import { useInView as useInViewFromFramer } from 'framer-motion';
import "react-image-gallery/styles/css/image-gallery.css";

export default function useInView({ once = true, margin = "-30px 0px 0px 0px"} = {}) {
  const ref = useRef(null)
  const isInView = useInViewFromFramer(ref, {
    once: once
  })

  return [ref, isInView]
}

export const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

