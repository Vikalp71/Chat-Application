import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Eye, EyeOff, Upload } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const compressImage = (canvas, quality = 0.7) => {
    return canvas.toDataURL("image/jpeg", quality);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set max dimensions to 300x300
        const maxWidth = 300;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(
              (height * maxWidth) / width
            );
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(
              (width * maxHeight) / height
            );
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with quality 0.7
        const compressedImage = compressImage(
          canvas,
          0.7
        );

        setAvatarPreview(compressedImage);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        avatar: avatarPreview,
      });

      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <MessageCircle size={32} />
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join ChatFlow today
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-upload-block">
            <label className="profile-upload-label">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />

              <div className="profile-upload-preview">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                  />
                ) : (
                  <div className="profile-upload-placeholder">
                    <Upload size={18} />
                  </div>
                )}
              </div>
              <span>Upload profile photo</span>
            </label>
          </div>

          <div className="form-group">
            <label>Full Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Username</label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
          </div>

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;