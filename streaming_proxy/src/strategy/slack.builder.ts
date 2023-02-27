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

interface DefaultAttachment {
  color: string;
  pretext: string;
  fields: Array<Field>;
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
  imageAttachments: Array<ImageAttachment>;

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

  addImage(imageUrl: string, title: string, text: string) {
    this.imageAttachments.push({
      fallback: "Image attachment",
      color: this.color,
      image_url: imageUrl,
      title,
      text,
    })
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
        ...this.imageAttachments
      ],
      blocks: this.blocks,
    };
  }
}

export default SlackBuilder;