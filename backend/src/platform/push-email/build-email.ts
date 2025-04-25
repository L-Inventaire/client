import Twig from "twig";

const root = __dirname + "/../../../assets/emails/";

export const buildHTML = async (content: {
  language: string;
  title: string;
  body: string;
  footer?: string;
  receipt?: [key: string, value: string][];
  post_receipt?: string;
  logo?: string;
}): Promise<{ html: string; text: string }> => {
  return new Promise((r, e) => {
    Twig.renderFile(root + "html.twig", { ...content }, (err, html) => {
      if (err) return e(err);
      Twig.renderFile(root + "text.twig", { ...content }, (err, text) => {
        if (err) return e(err);
        text = text.replace(/<br *\/?>/g, "\n");
        // keep links
        text = text.replace(/<a .*?href="([^"]+)".*?>([^<]+)<\/a>/g, "$2 ($1)");
        text = text.replace(/<a .*?href='([^']+)'.*?>([^<]+)<\/a>/g, "$2 ($1)");
        text = text.replace(/(<([^>]+)>)/gi, "");
        r({ html, text });
      });
    });
  });
};
