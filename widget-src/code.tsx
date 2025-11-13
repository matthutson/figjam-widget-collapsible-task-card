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
  { rowKey: "row1", text: "", color: colors[5] },
];

function CollapsibleTaskCard() {
  const [initialized, setInitialized] = useSyncedState<boolean>(
    "initialized",
    false
  );
  const [collapsed, setCollapsed] = useSyncedState("collapsed", false);
  const [pageTitle, setPageTitle] = useSyncedState("pageTitle", "");
  const [url, setUrl] = useSyncedState("url", "");
  const [cartId, setCartId] = useSyncedState("cartId", "");
  const [briefed, setBriefed] = useSyncedState<boolean>(
    "briefed",
    false
  );
  const [designed, setDesigned] = useSyncedState<boolean>("designed", false);
  const [built, setBuilt] = useSyncedState<boolean>("built", false);
  const [done, setDone] = useSyncedState<boolean>("done", false);
  const [lastUpdated, setLastUpdated] = useSyncedState<string>("lastUpdated", new Date().toLocaleDateString());
  const [rowKeys, setRowKeys] = useSyncedState<string[]>(
    "rowsNum",
    initialRows.map((header) => header.rowKey)
  );
  const [color, setColor] = useSyncedState("color", colors[4]);
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
      rowColors.set(newKey, colors[5]);
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

  // Duplicate widget
  const duplicateWidget = () => {
    figma.notify("To duplicate: Hold Option/Alt and drag the widget");
  };

  // Calculate progress percentage
  const getProgressPercentage = (): number => {
    let progress = 0;
    if (briefed) progress += 25;
    if (designed) progress += 25;
    if (built) progress += 25;
    if (done) progress += 25;
    return progress;
  };

  // Update last modified date
  const updateLastModified = () => {
    setLastUpdated(new Date().toLocaleDateString());
  };

  // Initialize widget with default rows
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    initialRows.forEach((initialRow) => {
      rows.set(initialRow.rowKey, initialRow.text || "");
      rowColors.set(initialRow.rowKey, initialRow.color || colors[5]);
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
      stroke="#333333"
      strokeWidth={2}
    >
      {/* Progress Slider */}
      <AutoLayout
        direction="vertical"
        width={"fill-parent"}
        spacing={8}
      >
        {/* Progress labels */}
        <AutoLayout
          direction="horizontal"
          width={"fill-parent"}
          horizontalAlignItems="space-between"
        >
          {[
            { text: "BRIEFED", state: briefed, setState: setBriefed },
            { text: "DESIGNED", state: designed, setState: setDesigned },
            { text: "BUILT", state: built, setState: setBuilt },
            { text: "DONE", state: done, setState: setDone },
          ].map((status, index) => (
            <AutoLayout
              key={status.text}
              onClick={() => {
                // Set this stage and all previous stages to true
                setBriefed(index >= 0);
                setDesigned(index >= 1);
                setBuilt(index >= 2);
                setDone(index >= 3);
                updateLastModified();
              }}
              hoverStyle={{ opacity: 0.7 }}
            >
              <Text
                fontSize={9}
                fontWeight={status.state ? 700 : 400}
                fontFamily="Roboto Mono"
                fill={status.state ? "#4CAF50" : "#999999"}
              >
                {status.text}
              </Text>
            </AutoLayout>
          ))}
        </AutoLayout>

        {/* Progress Bar */}
        <AutoLayout
          width={"fill-parent"}
          height={12}
          fill="#E8E8E8"
          cornerRadius={6}
          overflow="hidden"
          onClick={(e) => {
            // Calculate which stage was clicked based on position
            const percentage = e.x / (width as number - 32);
            if (percentage < 0.25) {
              setBriefed(true);
              setDesigned(false);
              setBuilt(false);
              setDone(false);
            } else if (percentage < 0.5) {
              setBriefed(true);
              setDesigned(true);
              setBuilt(false);
              setDone(false);
            } else if (percentage < 0.75) {
              setBriefed(true);
              setDesigned(true);
              setBuilt(true);
              setDone(false);
            } else {
              setBriefed(true);
              setDesigned(true);
              setBuilt(true);
              setDone(true);
            }
            updateLastModified();
          }}
        >
          {getProgressPercentage() > 0 && (
            <AutoLayout
              width={(width as number - 32) * (getProgressPercentage() / 100)}
              height={12}
              fill="#4CAF50"
            />
          )}
        </AutoLayout>
      </AutoLayout>

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

        {/* Duplicate Button */}
        <AutoLayout
          padding={8}
          fill="#F5F5F5"
          cornerRadius={6}
          hoverStyle={{ fill: "#E8E8E8" }}
          onClick={duplicateWidget}
          tooltip="Duplicate this card"
        >
          <SVG
            src={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#333333" stroke-width="2"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="#333333" stroke-width="2"/></svg>`}
          />
        </AutoLayout>

        <AutoLayout width={"fill-parent"} />

        {/* Last Updated - Editable */}
        <AutoLayout direction="vertical" spacing={4}>
          <Text fontSize={8} fontFamily="Roboto Mono" fill="#999999">
            LAST UPDATED
          </Text>
          <Input
            value={lastUpdated}
            fontSize={10}
            fontFamily="Roboto Mono"
            onTextEditEnd={(e) => setLastUpdated(e.characters)}
            inputFrameProps={{
              fill: "#F5F5F5",
              padding: { horizontal: 8, vertical: 4 },
              cornerRadius: 4,
            }}
          />
        </AutoLayout>
      </AutoLayout>

      {/* Page Title - Main Field */}
      <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
        <Text
          fontSize={13}
          fontWeight={700}
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
          }}
        />
      </AutoLayout>

      {/* URL Field */}
      <AutoLayout direction="vertical" width={"fill-parent"} spacing={6}>
        <Text
          fontSize={13}
          fontWeight={700}
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
                spacing={6}
                onClick={() => setSelectedRowKey(rowKey)}
                cornerRadius={8}
              >
                {/* Reorder controls */}
                <AutoLayout
                  direction="vertical"
                  spacing={4}
                  padding={6}
                  fill="#333333"
                  cornerRadius={6}
                  stroke="#CCCCCC"
                  strokeWidth={2}
                >
                  <SVG
                    src={`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 15L10 5M10 5L6 9M10 5L14 9" stroke="${isFirst ? '#999999' : '#FFFFFF'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    opacity={isFirst ? 0.4 : 1}
                    hoverStyle={{ opacity: isFirst ? 0.4 : 1 }}
                    onClick={() => { if (!isFirst) moveRowUp(rowKey); }}
                    tooltip={isFirst ? "" : "Move up"}
                  />
                  <SVG
                    src={`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 5L10 15M10 15L14 11M10 15L6 11" stroke="${isLast ? '#999999' : '#FFFFFF'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    opacity={isLast ? 0.4 : 1}
                    hoverStyle={{ opacity: isLast ? 0.4 : 1 }}
                    onClick={() => { if (!isLast) moveRowDown(rowKey); }}
                    tooltip={isLast ? "" : "Move down"}
                  />
                </AutoLayout>

                {/* Row content with delete button */}
                <AutoLayout
                  width={"fill-parent"}
                  direction="horizontal"
                  verticalAlignItems="center"
                  spacing={6}
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
                      height: rowContent ? "hug-contents" : 60,
                    }}
                  />
                  {/* Delete button */}
                  <AutoLayout
                    padding={4}
                  >
                    <SVG
                      src={`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="9" r="8" fill="#FF4444" opacity="0"/><path d="M12 6L6 12M6 6L12 12" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                      opacity={0}
                      hoverStyle={{ opacity: 1 }}
                      onClick={() => deleteRow(rowKey)}
                      tooltip="Delete row"
                    />
                  </AutoLayout>
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
          fontWeight={700}
          fill={"#666666"}
        >
          ADD ROW
        </Text>
      </AutoLayout>

      {/* Cart ID Field */}
      <AutoLayout
        direction="vertical"
        width={"fill-parent"}
        spacing={6}
        hidden={collapsed}
      >
        <Text
          fontSize={13}
          fontWeight={700}
          fontFamily="Roboto Mono"
          fill="#333333"
        >
          CART ID (IF RELEVANT)
        </Text>
        <Input
          width={"fill-parent"}
          placeholder="Optional cart identifier..."
          value={cartId}
          fontSize={14}
          fontFamily="Roboto Mono"
          onTextEditEnd={(e) => {
            setCartId(e.characters);
          }}
          inputFrameProps={{
            fill: "#FFFFFF",
            stroke: "#CCCCCC",
            strokeWidth: 1,
            padding: { horizontal: 14, vertical: 10 },
            cornerRadius: 8,
          }}
        />
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(CollapsibleTaskCard);
