/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongodb", "bson", "nodemailer", "bcryptjs"],
};

export default nextConfig;
