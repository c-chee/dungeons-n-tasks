import pool from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");

        return Response.json({
        success: true,
        data: rows,
        });
    } catch (err) {
        console.error(err);

        return Response.json(
        { success: false, error: err.message },
        { status: 500 }
        );
    }
}