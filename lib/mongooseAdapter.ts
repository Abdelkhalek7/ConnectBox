/* eslint-disable @typescript-eslint/no-explicit-any */
import { Adapter } from "next-auth/adapters";
import User from "@/models/User";
import Account from "@/models/Account";
import Session from "@/models/Session";
import { connectToDatabase } from "@/lib/mongoose";

export function MongooseAdapter(): Adapter {
  return {
    async createUser(user: any) {
      console.log("🚀 ~ createUser ~ user:", user);
      await connectToDatabase();
      const newUser = new User(user);
      await newUser.save();
      return { ...newUser.toObject(), id: newUser._id.toString() };
    },
    async getUser(id) {
      console.log("🚀 ~ getUser ~ id:", id);
      await connectToDatabase();

      const user = await User.findById(id);
      return user ? { ...user.toObject(), id: user._id.toString() } : null;
    },
    async getUserByEmail(email) {
      console.log("🚀 ~ getUserByEmail ~ email:", email);
      await connectToDatabase();

      const user = await User.findOne({ email });
      return user ? { ...user.toObject(), id: user._id.toString() } : null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      await connectToDatabase();

      const account = await Account.findOne({ providerAccountId, provider });
      if (!account) return null;
      const user = await User.findById(account.userId);
      return user ? { ...user.toObject(), id: user._id.toString() } : null;
    },
    async updateUser(user) {
      console.log("🚀 ~ updateUser ~ user:", user);
      await connectToDatabase();

      const updatedUser = await User.findByIdAndUpdate(user.id, user, {
        new: true,
      });
      return { ...updatedUser.toObject(), id: updatedUser._id.toString() };
    },
    async deleteUser(userId) {
      console.log("🚀 ~ deleteUser ~ userId:", userId);
      await connectToDatabase();

      await Promise.all([
        User.findByIdAndDelete(userId),
        Account.deleteMany({ userId }),
        Session.deleteMany({ userId }),
      ]);
    },
    async linkAccount(account: any) {
      console.log("🚀 ~ linkAccount ~ account:", account);
      await connectToDatabase();

      const newAccount = new Account(account);
      await newAccount.save();
      return newAccount.toObject();
    },
    async unlinkAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
      await connectToDatabase();

      await Account.findOneAndDelete({ providerAccountId, provider });
    },
    async createSession(session) {
      console.log("🚀 ~ createSession ~ session:", session);
      await connectToDatabase();

      const newSession = new Session(session);
      await newSession.save();
      return { ...newSession.toObject(), id: newSession._id.toString() };
    },
    async getSessionAndUser(sessionToken) {
      console.log("🚀 ~ getSessionAndUser ~ sessionToken:", sessionToken);
      await connectToDatabase();

      const session = await Session.findOne({ sessionToken });
      if (!session) return null;
      const user = await User.findById(session.userId);
      if (!user) return null;
      return {
        session: { ...session.toObject(), id: session._id.toString() },
        user: { ...user.toObject(), id: user._id.toString() },
      };
    },
    async updateSession(session) {
      console.log("🚀 ~ updateSession ~ session:", session);
      await connectToDatabase();

      const updatedSession = await Session.findOneAndUpdate(
        { sessionToken: session.sessionToken },
        session,
        { new: true }
      );
      return updatedSession
        ? { ...updatedSession.toObject(), id: updatedSession._id.toString() }
        : null;
    },
    async deleteSession(sessionToken) {
      console.log("🚀 ~ deleteSession ~ sessionToken:", sessionToken);
      await connectToDatabase();

      await Session.findOneAndDelete({ sessionToken });
    },
  };
}
