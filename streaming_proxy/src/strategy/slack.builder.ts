interface Field {
  title: string;
  value: any;
  short?: boolean;
}

interface BlockDetail {
  type: string;
  text: string;
  emoji?: boolean;
}

interface Block {
  type: string;
  text: BlockDetail;
}

interface ImageAttachment {
  fallback: string;
  image_url: string;
  color: string;
  title: string;
  text: string;
}

class SlackBuilder {
  color: string;
  pretext: string;
  fields: Array<Field>;
  blocks: Array<Block>;
  imageAttachment: ImageAttachment;

  constructor({ pretext }: Partial<{ color: string; pretext: string }>) {
    this.color = "#36a64f";
    this.pretext = pretext || "";
    this.fields = [];
    this.blocks = [];
  }

  addField(title: string, value: any, short: boolean = true) {
    this.fields.push({ title, short, value: `\`${value}\`` });
    return this;
  }

  addBlock(type: string, detail: BlockDetail) {
    this.blocks.push({ type, text: detail });
    return this;
  }

  toJSON() {
    return {
      as_user: false,
      attachments: [
        {
          color: this.color,
          pretext: this.pretext,
          fields: this.fields,
        },
        {
          fallback: "Image attachment",
          color: this.color,
          image_url: "https://user-images.githubusercontent.com/74334399/221478315-a4fcfc24-59b4-43bc-891a-e4bfb40dd425.png",
          title: "Latency 구간 별 정보",
          text: "process"
        }
      ],
      blocks: this.blocks,
    };
  }
}

export default SlackBuilder;