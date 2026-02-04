"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { ImageProps } from "next/image";

const LazyImage = ({ ...props }: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full">
      {!isLoaded && <Skeleton className="w-full h-full" />}
      <Image
        {...props}
        fill
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full object-cover rounded-xl aspect-video"
      />
    </div>
  );
};

export default LazyImage;
