import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    role:{type:String, enum:['user','admin'], default:'user'},
    isBlocked: { type: Boolean, default: false },
},{timestamps: true})

// ===================== link them without duplicating data. ===================== 
// ===================== console.log(user.profile)  ===================== 
userSchema.virtual("profile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "userId",
  justOne: true
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema)
export default User