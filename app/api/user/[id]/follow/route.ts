import { getCurrentUser } from "@/app/services/session";
import { toggleUserFollow } from "@/app/services/users";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const targetId = id.toLowerCase();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(targetId)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    const viewer = await getCurrentUser();

    if (!viewer) {
      return Response.json({ error: "Sign in to follow users." }, { status: 401 });
    }

    if (viewer.id === targetId) {
      return Response.json({ error: "You cannot follow yourself." }, { status: 400 });
    }

    const result = await toggleUserFollow(viewer.id, targetId);
    if (result === null) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Failed to toggle follow:", error);
    return Response.json({ error: "Unable to update follow status." }, { status: 500 });
  }
}
