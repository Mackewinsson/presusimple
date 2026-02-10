import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, comparePassword, validatePassword } from "@/lib/password";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/change-password
 * Allows an authenticated user to change their own password.
 * Requires the current password for verification.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Autenticación requerida. Por favor inicia sesión primero." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "La contraseña actual, nueva contraseña y confirmación son requeridas" },
        { status: 400 }
      );
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "La nueva contraseña y la confirmación no coinciden" },
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

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // User must have a password set to change it
    if (!user.password) {
      return NextResponse.json(
        { error: "No hay contraseña configurada para esta cuenta. Por favor configura una contraseña primero." },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 403 }
      );
    }

    // Hash and save new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
