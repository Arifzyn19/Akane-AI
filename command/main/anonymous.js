import { v4 as uuidv4 } from 'uuid';

export default {
  command: ["start", "leave", "next", "skip", "sendcontact"],
  description: "Anonymous Chat (Cari Teman/Pacar)",
  name: ["start", "leave", "next", "skip", "sendcontact"],
  tags: "anonymous",

  private: true,
  register: true,

  run: async (m, { conn, command }) => {
    command = command.toLowerCase();

    const ftextt = {
      key: {
        participant: "0@s.whatsapp.net",
        ...{ remoteJid: `0@s.whatsapp.net` },
      },
      message: { 
        extendedTextMessage: {
          text: "Anonymous Chat...",
          title: "",
        },
      },
    };

    const findRoom = (sender) => {
      return global.db.data.datas.anonymous.find(room => room.data.a === sender || room.data.b === sender);
    };

    const deleteRoom = (id) => {
      const index = global.db.data.datas.anonymous.findIndex(room => room.id === id);
      if (index !== -1) {
        global.db.data.datas.anonymous.splice(index, 1);
      }
    };

    switch (command) {
      case "next":
      case "skip":
      case "leave": {
        let room = findRoom(m.sender);
        if (!room)
          return conn.sendQuick(
            m.chat,
            "Kamu tidak sedang berada di anonymous chat",
            wm,
            "",
            [["Cari Partner", `.start`]],
            ftextt,
          );
        m.reply("Ok");
        let other = room.data.a === m.sender ? room.data.b : room.data.a;
        if (other)
          await conn.sendQuick(
            other,
            "Partner meninggalkan chat",
            wm,
            "",
            [["Cari Partner", `.start`]],
            ftextt,
          );
        deleteRoom(room.id);
        if (command === "leave") break;
      }
      case "start": {
        if (findRoom(m.sender))
          return conn.sendQuick(
            m.chat,
            "Kamu masih berada di dalam anonymous chat, menunggu partner",
            wm,
            '',
            [["Keluar", `.leave`]],
            ftextt,
          );

        const user = global.db.data.users[m.sender];
        if (!user || !user.registered) return m.reply(global.msg.notRegistered);

        let room = global.db.data.datas.anonymous.find(
          (room) => room.status === "WAITING" && !findRoom(m.sender),
        );

        if (room) {
          const partnerA = global.db.data.users[room.data.a];
          const partnerB = user;

          room.data.b = m.sender;
          room.status = "CHATTING";

          await conn.sendQuick(
            room.data.a,
            `Partner ditemukan! \n\nUmur: ${partnerB.age}\nGender: ${partnerB.gender}`,
            wm,
            "",
            [["Next", `.next`]],
            ftextt,
          );
          await conn.sendQuick(
            room.data.b,
            `Partner ditemukan! \n\nUmur: ${partnerA.age}\nGender: ${partnerA.gender}`,
            wm,
            "",
            [["Next", `.next`]],
            ftextt,
          );
        } else {
          const id = uuidv4();
          global.db.data.datas.anonymous.push({
            id,
            status: "WAITING",
            data: {
              a: m.sender,
              b: "",
              nama: user.name,
              umur: user.age,
              gender: user.gender,
              detail: "Tidak ada info"
            }
          });
          await conn.sendQuick(
            m.chat,
            "Menunggu partner...",
            wm,
            "",
            [["Keluar", `.leave`]],
            ftextt,
          );
        }
        break;
      }
      case "sendcontact": {
        let room = global.db.data.datas.anonymous.find(room => 
          (room.data.a === m.sender || room.data.b === m.sender) && room.status === 'CHATTING'
        );

        if (room) {
          const other = room.data.a === m.sender ? room.data.b : room.data.a;

          const formatNumber = (number) => number.replace('@s.whatsapp.net', '');

          if (other) {
            const ingfo = await m.reply(`Hai ${room.data.nama}, teman kamu send nomor nya nih.`, { from: other, quoted: ftextt });
            
            await conn.sendContact(other, [formatNumber(m.sender)], ingfo);
            await m.reply("Berhasil send contact kamu, tunggu di chat ya -_")
          } else {
            await m.reply("Kontak tidak ditemukan.");
          }
        } else {
          await m.reply("Kamu tidak berada dalam room anonymous");
        }
        break;
      }
    }
  },
};