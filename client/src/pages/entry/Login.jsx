import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate} from "react-router-dom";
import bg from "../../assets/bg.png";
import { loginUser } from "../../redux/role/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status} = useSelector((state) => state.auth);

  // React Hook Form setup onblur
  const {register,handleSubmit,formState: { errors },} = useForm({
    mode: "onBlur"
  });

const onSubmit = async (formData) => {
  try {
    const result = await dispatch(loginUser(formData)).unwrap();

    toast.success("Login successful!");
    if (result.role.toLowerCase() === "admin") navigate("/admin-dashboard");
    else navigate("/user-dashboard");

  } catch (err) {
    // err is string from rejectWithValue
    if (err.includes("blocked")) {
      toast.error(err); // permanent toast
      return;
    }

    toast.error(err || "Login failed");
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
          Login
        </h2>

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
          {status === "loading" ? "Logging in..." : "Login"}
        </button>

        <p className="mt-6 text-text-light text-center text-sm">
          Don't have an account? <span className="text-gold-primary underline" onClick={() => navigate("/register")}>Register here</span>
        </p>
      </form>
    </div>
  );
}
