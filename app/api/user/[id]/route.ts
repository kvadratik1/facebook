import { getUserProfile } from "@/app/services/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    const profile = await getUserProfile(id);

    if (!profile) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error("Failed to retrieve user profile:", error);
    return Response.json(
      { error: "Unable to retrieve user profile." },
      { status: 500 },
    );
  }
}
