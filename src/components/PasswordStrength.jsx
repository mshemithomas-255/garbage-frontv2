import React from "react";

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strength = getStrength();
  const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][
    strength
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < strength ? strengthColors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Strength:{" "}
        <span
          className={`font-medium ${strength >= 3 ? "text-green-600" : "text-orange-500"}`}
        >
          {strengthText}
        </span>
      </p>
    </div>
  );
};

export default PasswordStrength;
