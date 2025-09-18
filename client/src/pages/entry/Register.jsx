import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/bg.png"; // same background as Login
import { registerUser } from "../../redux/role/authSlice";

export default function Register() {
   const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
  });

 const onSubmit = async (formData) => {
    try {
      const resultAction = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Registration successful!");
        // Navigate based on role returned from backend
        const role = resultAction.payload.role.toLowerCase();
        if (role === "admin") navigate("/admin-dashboard");
        else navigate("/user-dashboard");
        reset();
      } else {
        toast.error(resultAction.payload || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong during registration.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border border-gold-primary text-gold-primary bg-text-dark/90 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-text-light text-center">
          Register
        </h2>

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 mb-2 font-semibold text-text-light border rounded"
          {...register("name", {
            required: "Full name is required",
            minLength: { value: 2, message: "Name must be at least 2 characters" },
          })}
        />
        {errors.name && (
          <p className="text-red-400 text-sm mb-2">! {errors.name.message}</p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-2 font-semibold text-text-light border rounded"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Enter a valid email",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mb-2">! {errors.email.message}</p>
        )}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-2 font-semibold text-text-light border rounded"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-400 text-sm mb-2">
            ! {errors.password.message}
          </p>
        )}

        {/* Submit */}
        <button type="submit" className="btn-secondary w-full p-3">
           {status === "loading" ? "Registering..." : "Register"}
        </button>
        <p className="mt-6 text-text-light text-center text-sm">
          Already have an account?{" "}<span className="text-gold-primary underline" onClick={() => navigate("/login")}>Login here</span>
        </p>
      </form>
    </div>
  );
}
