export async function hash(password: string) {
  // const Hash = createHash("sha256").update(password).digest("base64");
  const psswd = new TextEncoder().encode(password);
  const Hash = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    psswd,
  );
  // const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(Hash)));
  const hexHash = [...new Uint8Array(Hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexHash;
}

export async function verify({
  hash,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  try {
    const psswd = new TextEncoder().encode(password);
    const psswdHash = await crypto.subtle.digest(
      {
        name: "SHA-256",
      },
      psswd,
    );
    const hexHash = [...new Uint8Array(psswdHash)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    // const psswdHash = createHash("sha256").update(password).digest();
    // const hashBuff = Buffer.from(hash, "base64");
    // if (psswdHash.length != hashBuff.length) {
    //   return false;
    // }
    // return timingSafeEqual(psswdHash, hashBuff);
    // Vulnerable to timing attacks, but acceptable for this use case
    if (hexHash !== hash) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(`Verify error: ${error}`);
    return false;
  }
}
