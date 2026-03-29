import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTimes, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { setSecretWord } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

const SetSecretWordModal = ({ isOpen, onClose }) => {
  const [secretWord, setSecretWord] = useState("");
  const [confirmSecretWord, setConfirmSecretWord] = useState("");
  const [showSecretWord, setShowSecretWord] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!secretWord) newErrors.secretWord = "Secret word is required";
    if (secretWord.length < 4)
      newErrors.secretWord = "Secret word must be at least 4 characters";
    if (!confirmSecretWord)
      newErrors.confirmSecretWord = "Please confirm your secret word";
    if (secretWord !== confirmSecretWord)
      newErrors.confirmSecretWord = "Secret words do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await dispatch(setSecretWord({ secretWord, confirmSecretWord })).unwrap();
      toast.success(
        "Secret word set successfully! You can now use it for password recovery.",
      );
      onClose();
      setSecretWord("");
      setConfirmSecretWord("");
    } catch (error) {
      toast.error(error.msg || "Failed to set secret word");
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
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Set Secret Word
                </h2>
                <p className="text-green-100 text-sm">For password recovery</p>
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

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Secret Word
              </label>
              <div className="relative">
                <input
                  type={showSecretWord ? "text" : "password"}
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.secretWord ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter a secret word (min 4 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecretWord(!showSecretWord)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showSecretWord ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.secretWord && (
                <p className="text-red-500 text-xs mt-1">{errors.secretWord}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Choose a secret word that you'll remember. Use it to recover
                your password if forgotten.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Secret Word
              </label>
              <input
                type={showSecretWord ? "text" : "password"}
                value={confirmSecretWord}
                onChange={(e) => setConfirmSecretWord(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.confirmSecretWord
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Confirm your secret word"
                required
              />
              {errors.confirmSecretWord && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmSecretWord}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md"
              >
                {loading ? "Setting..." : "Set Secret Word"}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Important:</strong> Keep your secret word safe. You'll
              need it to reset your password if you ever forget it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetSecretWordModal;
