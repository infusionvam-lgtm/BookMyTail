import User from "../models/userModels.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@hotel.com"
    const existingAdmin = await User.findOne({role: "admin"})

    if(existingAdmin){
        console.log("super Admin already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 6)

    const admin = await User.create({
        name:"Admin",
        email: adminEmail,
        password: hashedPassword,
        role:"admin"
    })

    console.log(`✅ Super Admin created: ${admin.email}`);
}

export default createAdmin;