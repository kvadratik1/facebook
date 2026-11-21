import { getUserFollowers } from "@/app/services/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    const followers = await getUserFollowers(id);

    if (followers === null) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json({ followers });
  } catch (error) {
    console.error("Failed to retrieve followers:", error);
    return Response.json(
      { error: "Unable to retrieve followers." },
      { status: 500 },
    );
  }
}
