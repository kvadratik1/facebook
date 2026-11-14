import { getCommentBatch, InvalidCommentCursorError } from "../../../../services/comments";
import { getPostById } from "../../../../services/posts";

const headers = { "Cache-Control": "no-store" };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(postId) || postId <= 0 || postId > 2147483647) {
    return Response.json({ error: "Invalid post ID." }, { status: 400, headers });
  }

  const query = new URL(request.url).searchParams;
  if (query.getAll("cursor").length > 1) {
    return Response.json({ error: "Provide only one cursor." }, { status: 400, headers });
  }
  const cursor = query.get("cursor") ?? undefined;

  try {
    const post = await getPostById(postId);
    if (!post) {
      return Response.json({ error: "Post not found." }, { status: 404, headers });
    }

    // Comments are public; authentication is required only when posting.
    const batch = await getCommentBatch({ postId, cursor });
    return Response.json(batch, { headers });
  } catch (error) {
    if (error instanceof InvalidCommentCursorError) {
      return Response.json({ error: error.message }, { status: 400, headers });
    }
    return Response.json(
      { error: "Could not load comments. Please try again." },
      { status: 500, headers },
    );
  }
}
