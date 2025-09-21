import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * @swagger
 * /api/mobile-example:
 *   get:
 *     summary: Example protected mobile endpoint
 *     description: Example endpoint demonstrating JWT authentication for mobile apps
 *     tags: [Examples]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mobile authentication successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "688250e72a4d1976843ee892"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authorization header required"
 */
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  const { user } = authResult;

  return NextResponse.json({
    message: "Mobile authentication successful",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    timestamp: new Date().toISOString(),
  });
}

// POST /api/mobile-example - Example protected route for creating data
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request);
  
  if ("error" in authResult) {
    return authResult.error;
  }

  const { user } = authResult;
  const body = await request.json();

  return NextResponse.json({
    message: "Data created successfully",
    user: {
      id: user.id,
      email: user.email,
    },
    data: body,
    timestamp: new Date().toISOString(),
  });
}
