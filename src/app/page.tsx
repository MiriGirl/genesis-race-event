"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-10">
      {/* Poppins Test */}
      <div className="text-center">
        <h1 className="font-sans text-4xl font-bold">This is Poppins Bold</h1>
        <p className="font-sans text-lg font-normal mt-2">
          This is Poppins Regular
        </p>
      </div>

      {/* DragRacing Test */}
      <div className="text-center">
        <h1 className="font-dragracing text-5xl text-pink-500">
          This is DragRacing
        </h1>
        <p className="font-dragracing text-2xl text-gray-400">
          Custom local font loaded
        </p>
      </div>

      {/* Date Box Example */}
      <div className="flex justify-center items-center gap-10 mt-10">
        {/* Start */}
        <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[80px] h-[80px]">
        <span
  className="font-sans text-[30px] leading-[110%]"
  style={{ fontWeight: 700 }}
>
  26
</span>
          <span className="font-sans text-[18px] tracking-[0.04em] leading-[110%]">
            SEP
          </span>
        </div>

        {/* Dash */}
        <span className="font-sans font-bold text-[40px] mx-[40px]">–</span>

        {/* End */}
        <div className="flex flex-col items-center justify-center rounded-[16px] bg-[#610B89] w-[80px] h-[80px]">
          <span className="font-sans font-bold text-[30px] leading-[110%]">
            05
          </span>
          <span className="font-sans text-[18px] tracking-[0.04em] leading-[110%]">
            OCT
          </span>
        </div>
      </div>
    </div>
  );
}