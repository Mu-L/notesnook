/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { useState } from "react";
import tinycolor from "tinycolor2";
import { PopupWrapper } from "../../components/popup-presenter";
import { config } from "../../utils/config";
import { SplitButton } from "../components/split-button";
import { ColorPicker } from "../popups/color-picker";
import { useToolbarLocation } from "../stores/toolbar-store";
import { ToolProps } from "../types";
import { getToolbarElement } from "../utils/dom";

type ColorToolProps = ToolProps & {
  onColorChange: (color?: string) => void;
  activeColor: string;
  title: string;
  cacheKey: string;
};

export function ColorTool(props: ColorToolProps) {
  const {
    onColorChange,
    activeColor: _activeColor,
    title,
    cacheKey,
    ...toolProps
  } = props;
  const activeColor = _activeColor || config.get(cacheKey);
  const tColor = tinycolor(activeColor);
  const isBottom = useToolbarLocation() === "bottom";
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <SplitButton
      {...toolProps}
      iconColor={activeColor && tColor.isDark() ? "static" : "icon"}
      sx={{
        mr: 0,
        bg: activeColor || "transparent",
        ":hover": {
          bg: activeColor ? tColor.darken(5).toRgbString() : "transparent"
        }
      }}
      onOpen={() => setIsOpen((s) => !s)}
      toggled={isOpen}
      onClick={() => onColorChange(activeColor)}
    >
      <PopupWrapper
        isOpen={isOpen}
        id={props.icon}
        group={"color"}
        position={{
          isTargetAbsolute: true,
          target: getToolbarElement(),
          align: isBottom ? "center" : "end",
          location: isBottom ? "top" : "below",
          yOffset: 10
        }}
        focusOnRender={false}
        blocking={false}
        renderPopup={(close) => (
          <ColorPicker
            color={activeColor}
            onClear={() => {
              onColorChange();
              config.set(cacheKey, null);
            }}
            onChange={(color) => {
              onColorChange(color);
              config.set(cacheKey, color);
            }}
            onClose={close}
            title={title}
          />
        )}
      />
    </SplitButton>
  );
}

export function Highlight(props: ToolProps) {
  const { editor } = props;
  return (
    <ColorTool
      {...props}
      cacheKey="highlight"
      activeColor={editor.getAttributes("textStyle").backgroundColor}
      title={"Background color"}
      onColorChange={(color) =>
        color
          ? editor.current?.chain().focus().setHighlight(color).run()
          : editor.current?.chain().focus().unsetHighlight().run()
      }
    />
  );
}

export function TextColor(props: ToolProps) {
  const { editor } = props;
  return (
    <ColorTool
      {...props}
      cacheKey={"textColor"}
      activeColor={editor.getAttributes("textStyle").color}
      title="Text color"
      onColorChange={(color) =>
        color
          ? editor.current?.chain().focus().setColor(color).run()
          : editor.current?.chain().focus().unsetColor().run()
      }
    />
  );
}
