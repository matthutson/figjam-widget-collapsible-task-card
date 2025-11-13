const { widget } = figma;
const {
  AutoLayout,
  Input,
  Rectangle,
  SVG,
  Text,
  useEffect,
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
} = widget;

const colors: string[] = ["#FFA198", "#BDE3FF", "#AFF4C6", "#FFE8A3", "#FFFFFF", "#E8E8E8"];
const colorNames: string[] = ["Coral", "Blue", "Green", "Yellow", "White", "Light Grey"];

const initialRows: { rowKey: string; text: string; color?: string }[] = [
  { rowKey: "row1", text: "", color: colors[0] },
];

function CollapsibleTaskCard() {
  const [initialized, setInitialized] = useSyncedState<boolean>(
    "initialized",
    false
  );
  const [collapsed, setCollapsed] = useSyncedState("collapsed", false);
  const [pageTitle, setPageTitle] = useSyncedState("pageTitle", "");
  const [url, setUrl] = useSyncedState("url", "");
  const [linkedFrom, setLinkedFrom] = useSyncedState("linkedFrom", "");
  const [linkedTo, setLinkedTo] = useSyncedState("linkedTo", "");
  const [briefed, setBriefed] = useSyncedState<boolean>(
    "briefed",
    false
  );
  const [designed, setDesigned] = useSyncedState<boolean>("designed", false);
  const [built, setBuilt] = useSyncedState<boolean>("built", false);
  const [done, setDone] = useSyncedState<boolean>("done", false);
  const [rowKeys, setRowKeys] = useSyncedState<string[]>(
    "rowsNum",
    initialRows.map((header) => header.rowKey)
  );
  const [color, setColor] = useSyncedState("color", colors[2]);
  const [selectedRowKey, setSelectedRowKey] = useSyncedState<string | null>("selectedRowKey", null);
  const rows = useSyncedMap<string>("rows");
  const rowColors = useSyncedMap<string>("rowColors");

  // Add new row
  const addRow = () => {
    const newKey = (
      "00000" + Math.floor(Math.random() * 1_000_000).toString()
    ).slice(-6);

    if (rowKeys.includes(newKey)) {
      addRow();
    } else {
      setRowKeys([...rowKeys, newKey]);
      rowColors.set(newKey, colors[0]);
    }
  };

  // Delete row
  const deleteRow = (rowKey: string) => {
    setRowKeys(rowKeys.filter((key) => key !== rowKey));
    rows.delete(rowKey);
    rowColors.delete(rowKey);
  };

  // Move row up
  const moveRowUp = (rowKey: string) => {
    const index = rowKeys.indexOf(rowKey);
    if (index > 0) {
      const newKeys = [...rowKeys];
      [newKeys[index - 1], newKeys[index]] = [newKeys[index], newKeys[index - 1]];
      setRowKeys(newKeys);
    }
  };

  // Move row down
  const moveRowDown = (rowKey: string) => {
    const index = rowKeys.indexOf(rowKey);
    if (index < rowKeys.length - 1) {
      const newKeys = [...rowKeys];
      [newKeys[index], newKeys[index + 1]] = [newKeys[index + 1], newKeys[index]];
      setRowKeys(newKeys);
    }
  };

  // Initialize widget with default rows
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    initialRows.forEach((initialRow) => {
      rows.set(initialRow.rowKey, initialRow.text || "");
      rowColors.set(initialRow.rowKey, initialRow.color || colors[0]);
    });
  });

  // Widget property menu
  usePropertyMenu(
    [
      {
        itemType: "toggle",
        tooltip: collapsed ? "Expand" : "Collapse",
        propertyName: "toggle-collapsed",
        isToggled: false,
      },
      {
        itemType: "color-selector",
        tooltip: "Card Color",
        propertyName: "color",
        options: colors.map((color, index) => ({
          tooltip: colorNames[index],
          option: color
        })),
        selectedOption: color,
      },
      {
        itemType: "color-selector",
        tooltip: "Row Color (select a row first)",
        propertyName: "rowColor",
        options: colors.map((color, index) => ({
          tooltip: colorNames[index],
          option: color
        })),
        selectedOption: selectedRowKey ? (rowColors.get(selectedRowKey) ?? colors[0]) : colors[0],
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "toggle-collapsed") {
        setCollapsed(!collapsed);
      } else if (propertyName === "color" && propertyValue) {
        setColor(propertyValue);
      } else if (propertyName === "rowColor" && propertyValue && selectedRowKey) {
        rowColors.set(selectedRowKey, propertyValue);
      }
    }
  );

  const width: WidgetJSX.Size = 450;

  const shadow: WidgetJSX.Effect = {
    type: "drop-shadow",
    color: "#00000040",
    offset: { x: 0, y: 5 },
    blur: 15,
    showShadowBehindNode: false,
  };

  const toggleButtonShadow: WidgetJSX.Effect = {
    type: "inner-shadow",
    color: "#00000040",
    offset: { x: 0, y: 0 },
    blur: 2,
  };

  return (
    <AutoLayout
      name="Collapsible Task Card"
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={width}
      fill={color}
      spacing={12}
      padding={16}
      cornerRadius={12}
      overflow="visible"
      effect={shadow}
    >
      {/* Header */}
      <AutoLayout
        direction="horizontal"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        width={"fill-parent"}
        height={"hug-contents"}
        spacing={12}
      >
        {/* Collapse/Expand Arrow */}
        <AutoLayout
          padding={8}
          onClick={() => setCollapsed(!collapsed)}
          hoverStyle={{ opacity: 0.7 }}
          tooltip={collapsed ? "Expand" : "Collapse"}
        >
          <SVG
            src={collapsed
              ? `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 24L30 34L40 24" stroke="#333333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
              : `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 36L30 26L40 36" stroke="#333333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            }
          />
        </AutoLayout>

        <AutoLayout width={"fill-parent"} />

        {/* Status Buttons */}
        <AutoLayout
          direction="horizontal"
          spacing={12}
          padding={{ right: 4 }}
        >
          {[
            {
              text: "BRIEFED",
              state: briefed,
              setState: setBriefed,
              color: "#BDE3FF",
            },
            {
              text: "DESIGNED",
              state: designed,
              setState: setDesigned,
              color: "#FFA198",
            },
            {
              text: "BUILT",
              state: built,
              setState: setBuilt,
              color: "#FFE8A3",
            },
            { text: "DONE", state: done, setState: setDone, color: "#AFF4C6" },
          ].map((status) => (
            <AutoLayout
              key={status.text}
              direction="vertical"
              spacing={6}
              horizontalAlignItems="center"
            >
              <Text
                fontSize={10}
                fontWeight={700}
                fontFamily="Roboto Mono"
                fill="#333333"
              >
                {status.text}
              </Text>
              <Rectangle
                width={28}
                height={28}
                effect={toggleButtonShadow}
                onClick={() => {
                  status.setState(!status.state);
                }}
                fill={status.state ? status.color : "#ffffff"}
                stroke={status.state ? "#333333" : "#CCCCCC"}
                strokeWidth={status.state ? 2 : 1}
                cornerRadius={8}
                tooltip={status.state ? `Unmark as ${status.text}` : `Mark as ${status.text}`}
              />
            </AutoLayout>
          ))}
        </AutoLayout>
      </AutoLayout>

      {/* Page Title - Main Field */}
      <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
        <Text
          fontSize={13}
          fontWeight={600}
          fontFamily="Roboto Mono"
          fill="#333333"
        >
          PAGE TITLE
        </Text>
        <Input
          width={"fill-parent"}
          placeholder="Enter page title..."
          value={pageTitle}
          fontSize={28}
          fontWeight={700}
          fontFamily="Roboto Mono"
          lineHeight={36}
          onTextEditEnd={(e) => {
            setPageTitle(e.characters);
          }}
          inputBehavior="multiline"
          inputFrameProps={{
            fill: "#FFFFFF",
            stroke: "#CCCCCC",
            strokeWidth: 1.5,
            padding: { horizontal: 16, vertical: 16 },
            cornerRadius: 10,
            width: "fill-parent",
          }}
        />
      </AutoLayout>

      {/* URL Field */}
      <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
        <Text
          fontSize={13}
          fontWeight={600}
          fontFamily="Roboto Mono"
          fill="#333333"
        >
          URL
        </Text>
        <Input
          width={"fill-parent"}
          placeholder="https://..."
          value={url}
          fontSize={14}
          fontFamily="Roboto Mono"
          onTextEditEnd={(e) => {
            setUrl(e.characters);
          }}
          inputFrameProps={{
            fill: "#FFFFFF",
            stroke: "#CCCCCC",
            strokeWidth: 1,
            padding: { horizontal: 14, vertical: 10 },
            cornerRadius: 8,
            width: "fill-parent",
          }}
        />
      </AutoLayout>

      {/* Collapsible Content */}
      <AutoLayout
        direction="vertical"
        width={"fill-parent"}
        spacing={8}
        hidden={collapsed}
      >
        {/* Linked From / Linked To fields */}
        <AutoLayout
          direction="horizontal"
          width={"fill-parent"}
          spacing={8}
        >
          <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
            <Text
              fontSize={13}
              fontWeight={600}
              fontFamily="Roboto Mono"
              fill="#333333"
            >
              LINKED FROM
            </Text>
            <Input
              fontSize={13}
              fontFamily="Roboto Mono"
              value={linkedFrom}
              placeholder="Pages linking here..."
              onTextEditEnd={(e) => {
                setLinkedFrom(e.characters);
              }}
              inputBehavior="multiline"
              width={"fill-parent"}
              inputFrameProps={{
                fill: "#FFFFFF",
                stroke: "#CCCCCC",
                strokeWidth: 1,
                padding: { horizontal: 12, vertical: 10 },
                cornerRadius: 8,
                width: "fill-parent",
              }}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
            <Text
              fontSize={13}
              fontWeight={600}
              fontFamily="Roboto Mono"
              fill="#333333"
            >
              LINKED TO
            </Text>
            <Input
              fontSize={13}
              fontFamily="Roboto Mono"
              value={linkedTo}
              placeholder="Links to other pages..."
              onTextEditEnd={(e) => {
                setLinkedTo(e.characters);
              }}
              inputBehavior="multiline"
              width={"fill-parent"}
              inputFrameProps={{
                fill: "#FFFFFF",
                stroke: "#CCCCCC",
                strokeWidth: 1,
                padding: { horizontal: 12, vertical: 10 },
                cornerRadius: 8,
                width: "fill-parent",
              }}
            />
          </AutoLayout>
        </AutoLayout>

        {/* Text Rows */}
        <AutoLayout
          direction="vertical"
          width={"fill-parent"}
          spacing={4}
        >

          {rowKeys.map((rowKey, index) => {
            const rowContent = rows.get(rowKey) ?? "";
            const rowColor = rowColors.get(rowKey) ?? colors[0];
            const isSelected = selectedRowKey === rowKey;
            const isFirst = index === 0;
            const isLast = index === rowKeys.length - 1;

            return (
              <AutoLayout
                key={rowKey}
                direction="horizontal"
                width={"fill-parent"}
                verticalAlignItems="center"
                spacing={8}
                onClick={() => setSelectedRowKey(rowKey)}
                {...(isSelected && { stroke: "#333333", strokeWidth: 2 })}
                cornerRadius={8}
                padding={2}
              >
                {/* Reorder controls */}
                <AutoLayout
                  direction="vertical"
                  spacing={2}
                  padding={4}
                >
                  <SVG
                    src={`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L6 3M6 3L3 6M6 3L9 6" stroke="${isFirst ? '#CCCCCC' : '#666666'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    opacity={isFirst ? 0.3 : 0.6}
                    hoverStyle={{ opacity: isFirst ? 0.3 : 1 }}
                    onClick={() => !isFirst && moveRowUp(rowKey)}
                    tooltip={isFirst ? "" : "Move up"}
                  />
                  <SVG
                    src={`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3L6 9M6 9L9 6M6 9L3 6" stroke="${isLast ? '#CCCCCC' : '#666666'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    opacity={isLast ? 0.3 : 0.6}
                    hoverStyle={{ opacity: isLast ? 0.3 : 1 }}
                    onClick={() => !isLast && moveRowDown(rowKey)}
                    tooltip={isLast ? "" : "Move down"}
                  />
                </AutoLayout>

                {/* Row content */}
                <AutoLayout
                  width={"fill-parent"}
                  verticalAlignItems="center"
                >
                  <Input
                    value={rowContent}
                    placeholder=""
                    onTextEditEnd={(e) => rows.set(rowKey, e.characters)}
                    inputBehavior="multiline"
                    width={"fill-parent"}
                    fontSize={14}
                    fontFamily="Roboto Mono"
                    inputFrameProps={{
                      fill: rowColor,
                      stroke: isSelected ? "#333333" : "#CCCCCC",
                      strokeWidth: isSelected ? 2 : 1,
                      padding: { horizontal: 14, vertical: 10 },
                      cornerRadius: 8,
                      width: "fill-parent",
                      height: rowContent ? "hug-contents" : 60,
                    }}
                  />
                </AutoLayout>

                {/* Delete button */}
                <AutoLayout padding={4}>
                  <SVG
                    src={`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 12" stroke="#666666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4L12 12" stroke="#666666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    opacity={0}
                    hoverStyle={{ opacity: 1 }}
                    onClick={() => deleteRow(rowKey)}
                    tooltip="Delete row"
                  />
                </AutoLayout>
              </AutoLayout>
            );
          })}
        </AutoLayout>
      </AutoLayout>

      {/* Add Row Button */}
      <AutoLayout
        hidden={collapsed}
        width={"fill-parent"}
        height={36}
        fill={"#F5F5F5"}
        stroke="#CCCCCC"
        strokeWidth={1}
        hoverStyle={{ fill: "#E8E8E8" }}
        cornerRadius={8}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={6}
        onClick={addRow}
        tooltip="Add new row"
      >
        <Text fontSize={18} fill={"#666666"} fontWeight={400}>
          +
        </Text>
        <Text
          fontSize={13}
          fontFamily="Roboto Mono"
          fontWeight={600}
          fill={"#666666"}
        >
          ADD ROW
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(CollapsibleTaskCard);
