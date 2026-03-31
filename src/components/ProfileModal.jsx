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
  FaPhone,
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
    phone: "",
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
        phone: user.phone || "",
      });
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
          phone: profileData.phone,
        }),
      ).unwrap();
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
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

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      if (error.message === "Current password is incorrect") {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: "Current password is incorrect",
        });
      } else if (
        error.message === "New password must be different from current password"
      ) {
        setPasswordErrors({
          ...passwordErrors,
          newPassword: "New password must be different from current password",
        });
      } else {
        toast.error(error.message || "Failed to change password");
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

      toast.success("Secret word set successfully!");

      setSecretWordData({
        secretWord: "",
        confirmSecretWord: "",
      });
      setSecretWordErrors({
        secretWord: "",
        confirmSecretWord: "",
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Failed to set secret word");
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

    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: "",
      });
    }

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

    if (secretWordErrors[field]) {
      setSecretWordErrors({
        ...secretWordErrors,
        [field]: "",
      });
    }

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
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="bg-green-600 px-5 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaUserCircle className="text-white text-xl" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Profile Settings
                </h2>
                <p className="text-green-100 text-xs">Manage your account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 text-center text-sm font-medium transition ${
              activeTab === "profile"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaUser className="inline mr-1 text-xs" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-2 text-center text-sm font-medium transition ${
              activeTab === "password"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaKey className="inline mr-1 text-xs" />
            Security
          </button>
          <button
            onClick={() => setActiveTab("secret")}
            className={`flex-1 py-2 text-center text-sm font-medium transition ${
              activeTab === "secret"
                ? "text-green-600 border-b-2 border-green-600 bg-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FaShieldAlt className="inline mr-1 text-xs" />
            Secret
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-1 text-green-600 text-xs" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-1 text-green-600 text-xs" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 0712345678"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-1 text-green-600 text-xs" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FaSave className="inline mr-1" />
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordInputChange("newPassword", e.target.value)
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      passwordErrors.newPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Min 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
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
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FaLock className="inline mr-1" />
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}

          {/* Secret Word Tab */}
          {activeTab === "secret" && (
            <div className="space-y-3">
              {user?.secretWordSet ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-1">
                    <FaShieldAlt className="text-green-600 mr-1 text-sm" />
                    <h3 className="font-semibold text-green-800 text-sm">
                      Secret Word Set
                    </h3>
                  </div>
                  <p className="text-xs text-green-700">
                    Your secret word is set. You can use it to recover your
                    password.
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    For security, you cannot view or change it once set.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSetSecretWord} className="space-y-3">
                  <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
                    <p className="text-xs text-yellow-800">
                      <strong>⚠️ Not set!</strong> Set a secret word to recover
                      your password if forgotten.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <FaShieldAlt className="inline mr-1 text-green-600 text-xs" />
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
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          secretWordErrors.secretWord
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Min 4 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretWord(!showSecretWord)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showSecretWord ? (
                          <FaEyeSlash className="text-sm" />
                        ) : (
                          <FaEye className="text-sm" />
                        )}
                      </button>
                    </div>
                    {secretWordErrors.secretWord && (
                      <p className="text-red-500 text-xs mt-1">
                        {secretWordErrors.secretWord}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          secretWordErrors.confirmSecretWord
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm secret word"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmSecretWord(!showConfirmSecretWord)
                        }
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmSecretWord ? (
                          <FaEyeSlash className="text-sm" />
                        ) : (
                          <FaEye className="text-sm" />
                        )}
                      </button>
                    </div>
                    {secretWordErrors.confirmSecretWord && (
                      <p className="text-red-500 text-xs mt-1">
                        {secretWordErrors.confirmSecretWord}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <FaShieldAlt className="inline mr-1" />
                      {loading ? "Setting..." : "Set Secret Word"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full text-gray-600 text-sm font-medium py-1.5 hover:text-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
