"use client";
import { useState, ChangeEvent } from "react";

/**
 * Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to *`target`.
 * You may assume that each input would have ***exactly***** one solution**, and you may not use the *same* element twice.
 * You can return the answer in any order.
 */

interface CodeSubmitProps {
  onSubmit?: (code: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function CodeInputWithButton({
  onSubmit,
  initialValue = "",
  placeholder = "Enter your code here...",
}: CodeSubmitProps) {
  const [codeValue, setCodeValue] = useState<string>(initialValue);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setCodeValue(e.target.value);
  };

  const handleSubmit = (): void => {
    // Handle the submission here
    console.log("Submitted code:", codeValue);
    // Call the onSubmit prop if provided
    if (onSubmit) {
      onSubmit(codeValue);
    }
    // Optional: clear the input after submission
    // setCodeValue('');
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-4 p-6">
      <h2 className="text-xl font-semibold">Code Entry</h2>
      <div className="flex flex-col space-y-4">
        <textarea
          value={codeValue}
          onChange={handleChange}
          className="h-96 w-full rounded-md border border-gray-300 px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={placeholder}
          spellCheck={false}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
