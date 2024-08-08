export default {
  command: ["smeme", "stickermeme"],
  description: "Convert image sticker meme",
  name: "smeme",
  tags: "convert",

  run: async (m) => {
    const quoted = m.isQuoted ? m.quoted : m;
    let respond = `Kirim/reply image/sticker dengan caption ${m.prefix + m.command} text1|text2`;
    if (!/image/.test(quoted.msg.mimetype)) return m.reply(respond);
    if (!m.text) return m.reply(respond);
    let [atas = "-", bawah = "-"] = m.text.split(`|`);
    const medias = await quoted.download();
    let url =
      /image|video/i.test(quoted.msg.mimetype) &&
      !/webp/i.test(quoted.msg.mimetype)
        ? await func.upload.telegra(medias)
        : await func.upload.pomf(medias);
    let smeme = `https://api.memegen.link/images/custom/${encodeURIComponent(bawah)}/${encodeURIComponent(atas)}.png?background=${url}`;
    m.reply(smeme, { asSticker: true });
  },
};
