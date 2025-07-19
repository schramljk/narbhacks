const Checkbox = ({
  isChecked,
  checkHandler,
  openaiKeySet,
}: {
  isChecked: boolean;
  checkHandler: () => void;
  openaiKeySet: boolean;
}) => {
  return (
    <div className="relative flex  gap-x-3">
      <div className="flex items-start mt-[5px]">
        <input
          id="candidates"
          name="candidates"
          type="checkbox"
          checked={isChecked}
          onChange={checkHandler}
          className="accent-white checked:accent-white w-5 h-5 focus:ring-0 focus:outline-0  border-[#0D87E1] rounded-[6px] bg-[#F9F5FF]"
          disabled={!openaiKeySet}
        />
      </div>
      <div className="">
        <label
          htmlFor="candidates"
          className=" text-black text-[17px] sm:text-2xl pb-2 not-italic font-light leading-[90.3%] tracking-[-0.6px]"
        >
          AI Summary {openaiKeySet ? "" : " (Basic Summary Available)"}
        </label>
        {openaiKeySet ? (
          <p className=" text-black text-sm sm:text-[17px] not-italic font-extralight leading-[90.3%] tracking-[-0.425px]">
            Check this box to generate an AI-powered summary of your entry
          </p>
        ) : (
          <p className=" text-black text-sm sm:text-[17px] not-italic font-extralight leading-[90.3%] tracking-[-0.425px]">
            AI summaries are currently unavailable due to API quota limits. Basic summaries will be generated instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkbox;
