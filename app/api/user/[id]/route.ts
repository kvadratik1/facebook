import { getCurrentUser } from "@/app/services/session";
import { getUserProfile, isUserFollowing } from "@/app/services/users";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400, headers });
  }

  try {
    const [profile, viewer] = await Promise.all([getUserProfile(id), getCurrentUser()]);

    if (!profile) {
      return Response.json({ error: "User not found." }, { status: 404, headers });
    }

    const isFollowing = viewer ? await isUserFollowing(viewer.id, profile.id) : false;
    return Response.json({ ...profile, isFollowing }, { headers });
  } catch (error) {
    console.error("Failed to retrieve user profile:", error);
    return Response.json(
      { error: "Unable to retrieve user profile." },
      { status: 500, headers },
    );
  }
}
