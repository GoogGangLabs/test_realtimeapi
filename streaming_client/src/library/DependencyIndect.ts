import Container from "@domain/Container";
import Socket from "@domain/Socket";

const DependencyInject = () => {
  Container.put("PreSocket", new Socket("preprocess"));
  Container.put("PostSocket", new Socket("postprocess"));
};

export default DependencyInject;
