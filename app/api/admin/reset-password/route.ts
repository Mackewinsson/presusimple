import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, validatePassword } from "@/lib/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Must match the AUTHORIZED_ADMINS list used across admin pages
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com",
];

/**
 * POST /api/admin/reset-password
 * Allows an admin to reset any user's password.
 * Does not require the user's current password.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Autenticación requerida" },
        { status: 401 }
      );
    }

    // Check admin authorization
    if (!AUTHORIZED_ADMINS.includes(session.user.email)) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren privilegios de administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "El correo del usuario y la nueva contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "La validación de contraseña falló", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: `Contraseña restablecida exitosamente para ${email}`,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        hasPassword: true,
      },
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
