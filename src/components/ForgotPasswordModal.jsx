import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  FaTimes,
  FaKey,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { verifySecretWord, resetPassword } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Secret Word, 3: New Password
  const [email, setEmail] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    setErrors({});

    // For demo purposes, check if email exists (you can add email validation)
    setStep(2);
    setLoading(false);
  };

  const handleVerifySecretWord = async (e) => {
    e.preventDefault();
    if (!secretWord) {
      toast.error("Please enter your secret word");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        verifySecretWord({ email, secretWord }),
      ).unwrap();
      setResetToken(result.resetToken);
      toast.success("Secret word verified!");
      setStep(3);
    } catch (error) {
      toast.error(error.msg || "Invalid secret word");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        resetPassword({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      ).unwrap();

      toast.success(
        "Password reset successfully! Please login with your new password.",
      );
      onClose();

      // Reset form
      setStep(1);
      setEmail("");
      setSecretWord("");
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      toast.error(error.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <FaKey className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Forgot Password
                </h2>
                <p className="text-green-100 text-sm">
                  Reset your password using secret word
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                step >= stepNum
                  ? "text-green-600 border-b-2 border-green-600 bg-white"
                  : "text-gray-400"
              }`}
            >
              Step {stepNum}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your registered email"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll verify your identity using your secret word
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md"
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifySecretWord} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaShieldAlt className="inline mr-2 text-green-600" />
                  Secret Word
                </label>
                <input
                  type="text"
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your secret word"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the secret word you set up for password recovery
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-green-600" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
