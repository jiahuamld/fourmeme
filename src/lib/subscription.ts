import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getUserSubscriptionPlan() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      isSubscribed: false,
      stripeCustomerId: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeCustomerId: true,
      subscriptions: {
        where: {
          status: 'active',
        },
      },
    },
  });

  return {
    isSubscribed: user?.subscriptions.length > 0,
    stripeCustomerId: user?.stripeCustomerId,
  };
}
