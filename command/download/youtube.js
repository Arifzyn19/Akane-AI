export default {
  command: ["ytmp3", "ytmp4"],
  description: "Download video/audio dari YouTube",
  name: ["ytmp3", "ytmp4"],
  tags: "download",

  example:
    "[!] Silakan masukkan URL video/audio.\n\nContoh: %p%cmd https://youtube.com/watch?v=TicGJQqrq2M",

  run: async (m, { conn }) => {
    const url = m.text;
    if (!func.isUrl(url)) {
      return m.reply("[!] Silakan masukkan URL video/audio YouTube.");
    }

    try {
      const isAudio = m.command === "ytmp3";
      const response = await func.fetchJson(API("arifzyn", "/download/youtube", { url: func.isUrl(url)[0] }, "apikey"))
      if (response.status !== 200) return m.reply(func.format(response))
      const result = response.result 
      const responseUrl = isAudio
        ? result.audio["128"].url 
        : result.video["720p"].url;
      const title = result.title.replace(/[\\/:*?"<>|]/g, ""); // remove illegal characters for file names
      const extension = isAudio ? "mp3" : "mp4";
      const filename = `${title}.${extension}`;

      await m.reply(responseUrl, {
        mimetype: isAudio ? "audio/mpeg" : "video/mp4",
        fileName: filename,
      });
    } catch (error) {
      console.error("Error downloading YouTube video:", error);
      m.reply(func.format(error?.response?.data));
    }
  },
};
