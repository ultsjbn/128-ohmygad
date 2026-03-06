import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        display_name: true,
        contact_num: true,
        address: true,
        pronouns: true,
        sex_at_birth: true,
        gender_identity: true,
        college: true,
        program: true,
        student_num: true,
        year_level: true,
        gso_attended: true,
        is_onboarded: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user); // ✅ Must return JSON
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}