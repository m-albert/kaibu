import { expect } from "chai";
import ItkVtkLayer from "@/components/layers/ItkVtkLayer.vue";
import VectorLayer from "@/components/layers/VectorLayer.vue";

describe("ITK/VTK image color maps", () => {
  it("uses the legacy component-first viewer API", () => {
    const calls = [];
    const context = {
      viewer: {
        setColorMap: (...args) => calls.push(args)
      }
    };

    ItkVtkLayer.methods.setImageColorMap.call(context, "Grayscale", 0);

    expect(calls).to.deep.equal([[0, "Grayscale"]]);
  });

  it("uses the modern preset-first viewer API", () => {
    const calls = [];
    const context = {
      viewer: {
        setImageColorMap: (...args) => calls.push(args)
      }
    };

    ItkVtkLayer.methods.setImageColorMap.call(context, "Grayscale", 0);

    expect(calls).to.deep.equal([["Grayscale", 0]]);
  });
});

describe("vector interaction modes", () => {
  function createContext() {
    return {
      config: { draw_enable: false },
      selectIsActive: false,
      enableSelectInteraction() {
        this.selectIsActive = true;
      },
      disableSelectInteraction() {
        this.selectIsActive = false;
      },
      updateDrawInteraction() {},
      $forceUpdate() {}
    };
  }

  it("switches between cursor, select and draw", () => {
    const context = createContext();

    VectorLayer.methods.setInteractionMode.call(context, "select");
    expect(context.selectIsActive).to.equal(true);
    expect(context.config.draw_enable).to.equal(false);

    VectorLayer.methods.setInteractionMode.call(context, "draw");
    expect(context.selectIsActive).to.equal(false);
    expect(context.config.draw_enable).to.equal(true);

    VectorLayer.methods.setInteractionMode.call(context, "cursor");
    expect(context.selectIsActive).to.equal(false);
    expect(context.config.draw_enable).to.equal(false);
  });

  it("rejects unknown modes", () => {
    const context = createContext();

    expect(() =>
      VectorLayer.methods.setInteractionMode.call(context, "unknown")
    ).to.throw("Unsupported interaction mode");
  });

  it("maps C, V and D to interaction modes", async () => {
    const modes = [];
    let callbackCalls = 0;
    const context = {
      selected: true,
      visible: true,
      config: {
        key_press_callback: () => {
          callbackCalls += 1;
        }
      },
      setInteractionMode: mode => modes.push(mode),
      deleteDraw() {},
      undoDraw() {},
      moveSelected() {}
    };
    const event = code => ({
      code,
      target: null,
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      shiftKey: false
    });

    await VectorLayer.methods.keyHandler.call(context, event("KeyC"));
    await VectorLayer.methods.keyHandler.call(context, event("KeyV"));
    await VectorLayer.methods.keyHandler.call(context, event("KeyD"));

    expect(modes).to.deep.equal(["cursor", "select", "draw"]);
    expect(callbackCalls).to.equal(0);
  });
});
