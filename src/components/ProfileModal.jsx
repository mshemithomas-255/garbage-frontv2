import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaKey,
  FaUserCircle,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import {
  updateProfile,
  changePassword,
  setSecretWord,
} from "../redux/slices/authSlice";
import toast from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [secretWordData, setSecretWordData] = useState({
    secretWord: "",
    confirmSecretWord: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [secretWordErrors, setSecretWordErrors] = useState({
    secretWord: "",
    confirmSecretWord: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretWord, setShowSecretWord] = useState(false);
  const [showConfirmSecretWord, setShowConfirmSecretWord] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
      // Reset forms when modal opens
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecretWordData({
        secretWord: "",
        confirmSecretWord: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSecretWordErrors({
        secretWord: "",
        confirmSecretWord: "",
      });
    }
  }, [user, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        return;
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Validate password fields
  const validatePasswordForm = () => {
    let isValid = true;
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword =
        "New password must be different from current password";
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Validate secret word fields
  const validateSecretWordForm = () => {
    let isValid = true;
    const errors = {
      secretWord: "",
      confirmSecretWord: "",
    };

    if (!secretWordData.secretWord) {
      errors.secretWord = "Secret word is required";
      isValid = false;
    } else if (secretWordData.secretWord.length < 4) {
      errors.secretWord = "Secret word must be at least 4 characters";
      isValid = false;
    }

    if (!secretWordData.confirmSecretWord) {
      errors.confirmSecretWord = "Please confirm your secret word";
      isValid = false;
    } else if (secretWordData.secretWord !== secretWordData.confirmSecretWord) {
      errors.confirmSecretWord = "Secret words do not match";
      isValid = false;
    }

    setSecretWordErrors(errors);
    return isValid;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        updateProfile({
          name: profileData.name,
          email: profileData.email,
        }),
      ).unwrap();
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      ).unwrap();

      toast.success("Password changed successfully!");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close modal after successful change
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Password change error:", error);
      if (error.msg === "Current password is incorrect") {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: "Current password is incorrect",
        });
      } else if (
        error.msg === "New password must be different from current password"
      ) {
        setPasswordErrors({
          ...passwordErrors,
          newPassword: "New password must be different from current password",
        });
      } else {
        toast.error(error.msg || "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetSecretWord = async (e) => {
    e.preventDefault();

    if (!validateSecretWordForm()) {
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        setSecretWord({
          secretWord: secretWordData.secretWord,
          confirmSecretWord: secretWordData.confirmSecretWord,
        }),
      ).unwrap();

      toast.success(
        "Secret word set successfully! You can now use it for password recovery.",
      );

      // Reset form
      setSecretWordData({
        secretWord: "",
        confirmSecretWord: "",
      });
      setSecretWordErrors({
        secretWord: "",
        confirmSecretWord: "",
      });

      // Close modal after successful set
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error.msg || "Failed to set secret word");
    } finally {
      setLoading(false);
    }
  };

  // Real-time password validation
  const handlePasswordInputChange = (field, value) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    });

    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: "",
      });
    }

    // Real-time confirm password validation
    if (field === "confirmPassword" || field === "newPassword") {
      if (
        field === "newPassword" &&
        passwordData.confirmPassword &&
        value !== passwordData.confirmPassword
      ) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: "Passwords do not match",
        });
      } else if (
        field === "confirmPassword" &&
        passwordData.newPassword &&
        value !== passwordData.newPassword
      ) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: "Passwords do not match",
        });
      } else if (
        value === passwordData.newPassword ||
        (field === "newPassword" && value === passwordData.confirmPassword)
      ) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: "",
        });
      }
    }
  };

  // Real-time secret word validation
  const handleSecretWordInputChange = (field, value) => {
    setSecretWordData({
      ...secretWordData,
      [field]: value,
    });

    // Clear error when user starts typing
    if (secretWordErrors[field]) {
      setSecretWordErrors({
        ...secretWordErrors,
        [field]: "",
      });
    }

    // Real-time confirm secret word validation
    if (
      field === "confirmSecretWord" &&
      secretWordData.secretWord &&
      value !== secretWordData.secretWord
    ) {
      setSecretWordErrors({
        ...secretWordErrors,
        confirmSecretWord: "Secret words do not match",
      });
    } else if (
      field === "secretWord" &&
      secretWordData.confirmSecretWord &&
      value !== secretWordData.confirmSecretWord
    ) {
      setSecretWordErrors({
        ...secretWordErrors,
        confirmSecretWord: "Secret words do not match",
      });
    } else if (
      value === secretWordData.secretWord ||
      (field === "secretWord" && value === secretWordData.confirmSecretWord)
    ) {
      setSecretWordErrors({
        ...secretWordErrors,
        confirmSecretWord: "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-fade-in"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <FaUserCircle className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Profile Settings
                </h2>
                <p className="text-green-100 text-sm">
                  Manage your account information
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "profile"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FaUser className="inline mr-2 text-sm" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "password"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FaKey className="inline mr-2 text-sm" />
            Security
          </button>
          <button
            onClick={() => setActiveTab("secret")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
              activeTab === "secret"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FaShieldAlt className="inline mr-2 text-sm" />
            Secret Word
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 140px)" }}
        >
          {/* Personal Info Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-green-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-green-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <FaSave className="inline mr-2" />
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Security/Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordInputChange(
                        "currentPassword",
                        e.target.value,
                      )
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.currentPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordInputChange("newPassword", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordInputChange(
                        "confirmPassword",
                        e.target.value,
                      )
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <FaLock className="inline mr-2" />
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}

          {/* Secret Word Tab */}
          {activeTab === "secret" && (
            <div className="space-y-5">
              {user?.secretWordSet ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <FaShieldAlt className="text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">
                      Secret Word Set
                    </h3>
                  </div>
                  <p className="text-sm text-green-700">
                    Your secret word is already set. You can use it to recover
                    your password if needed.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    <strong>Note:</strong> For security reasons, you cannot view
                    or change your secret word once set.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSetSecretWord} className="space-y-5">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Secret word not set!</strong> Setting a secret
                      word allows you to recover your password if you forget it.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaShieldAlt className="inline mr-2 text-green-600" />
                      Secret Word
                    </label>
                    <div className="relative">
                      <input
                        type={showSecretWord ? "text" : "password"}
                        value={secretWordData.secretWord}
                        onChange={(e) =>
                          handleSecretWordInputChange(
                            "secretWord",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                          secretWordErrors.secretWord
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter a secret word (min 4 characters)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretWord(!showSecretWord)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecretWord ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {secretWordErrors.secretWord && (
                      <p className="text-red-500 text-xs mt-1">
                        {secretWordErrors.secretWord}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a secret word that you'll remember. Use it to
                      recover your password if forgotten.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Secret Word
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmSecretWord ? "text" : "password"}
                        value={secretWordData.confirmSecretWord}
                        onChange={(e) =>
                          handleSecretWordInputChange(
                            "confirmSecretWord",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                          secretWordErrors.confirmSecretWord
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm your secret word"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmSecretWord(!showConfirmSecretWord)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmSecretWord ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {secretWordErrors.confirmSecretWord && (
                      <p className="text-red-500 text-xs mt-1">
                        {secretWordErrors.confirmSecretWord}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      <FaShieldAlt className="inline mr-2" />
                      {loading ? "Setting..." : "Set Secret Word"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer with close button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
