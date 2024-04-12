import { readFileSync } from "fs";
import path from "path";

const buffer = readFileSync(path.join(process.cwd(), "./course.json"));
const course = JSON.parse(buffer);
const BASE_URL = course?.productionBaseUrl || "";

const config = {
  output: "export",
  basePath: BASE_URL,
  env: {
    BASE_URL,
  },
};

if (process.env.NODE_ENV === "development" && BASE_URL) {
  config.redirects = async () => {
    console.log(`ℹ️ ignore the warning 'Specified "redirects" will not automatically work with "output: export"'. This redirect only happens in development mode.`)
    return [
      {
        source: "/",
        destination: BASE_URL,
        basePath: false,
        permanent: false,
      },
    ];
  }
}

export default config;
