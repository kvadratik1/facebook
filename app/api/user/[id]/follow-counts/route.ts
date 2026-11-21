import { getUserFollowCounts } from "@/app/services/users";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  try {
    const counts = await getUserFollowCounts(id);

    if (counts === null) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    return Response.json(counts);
  } catch (error) {
    console.error("Failed to retrieve follow counts:", error);
    return Response.json(
      { error: "Unable to retrieve follow counts." },
      { status: 500 },
    );
  }
}
