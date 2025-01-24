import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, { name, email, picture, uid }) => {
    try {
      
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("uid"), uid))
        .unique();

      if (existingUser) {
       
        await ctx.db.patch(existingUser._id, {
          name,
          email,
          picture,
          createdAt: existingUser.createdAt || new Date().toISOString()
        });
        return existingUser._id;
      }

      const userId = await ctx.db.insert("users", {
        name,
        email,
        picture,
        uid,
        createdAt: new Date().toISOString()
      });

      return userId;
    } catch (error) {
      console.error("Error in CreateUser mutation:", error);
      throw new Error("Failed to create user: " + error.message);
    }
  },
});

export const GetUser = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.email) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    return user;
  },
});