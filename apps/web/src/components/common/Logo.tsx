import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  isMobile?: boolean;
  color?: string;
}

const Logo = ({ isMobile, color = "text-black" }: Props) => {
  return (
    <Link href={"/"}>
      <div className="flex gap-2 items-center">
        <Image src={"/images/mosaic.png"} width={26} height={26} alt="logo" />
        {!isMobile ? (
          <h1 className={`font-montserrat ${color} text-3xl sm:text-[35px] not-italic font-normal leading-[90.3%] tracking-[-0.875px]`}>
            MosAIc
          </h1>
        ) : null}
      </div>
    </Link>
  );
};

export default Logo;
