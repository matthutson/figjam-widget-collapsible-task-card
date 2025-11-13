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

const colors: string[] = ["#FFA198", "#BDE3FF", "#AFF4C6", "#FFE8A3"];

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
  const [mainContentText, setMainContentText] = useSyncedState(
    "mainContentText",
    ""
  );
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
  const rows = useSyncedMap<string>("rows");
  const rowColors = useSyncedMap<string>("rowColors");

  /** 행 추가 */
  const addRow = () => {
    const newKey = (
      "00000" + Math.floor(Math.random() * 1_000_000).toString()
    ).slice(-6);

    if (rowKeys.includes(newKey)) {
      addRow();
    } else {
      setRowKeys([...rowKeys, newKey]);
      // Set default color for new row
      rowColors.set(newKey, colors[0]);
    }
  };

  /** 행 삭제 */
  const deleteRow = (rowKey: string) => {
    setRowKeys(rowKeys.filter((key) => key !== rowKey));
    rows.delete(rowKey);
    rowColors.delete(rowKey);
  };

  /** 위젯이 처음 생성되면 기본 테이블 행을 설정합니다. */
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    initialRows.forEach((initialRow) => {
      rows.set(initialRow.rowKey, initialRow.text || "");
      rowColors.set(initialRow.rowKey, initialRow.color || colors[0]);
    });
  });

  /** 위젯 메뉴 설정 */
  usePropertyMenu(
    [
      {
        itemType: "toggle",
        tooltip: collapsed ? "펼치기" : "접기",
        propertyName: "toggle-collpased",
        isToggled: false,
      },
      {
        itemType: "color-selector",
        tooltip: "카드 색상",
        propertyName: "color",
        options: colors.map((color) => ({ tooltip: color, option: color })),
        selectedOption: color,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "toggle-collpased") {
        setCollapsed(!collapsed);
      } else if (propertyName === "color" && propertyValue) {
        setColor(propertyValue);
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
      name="Widget"
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={width}
      fill={color}
      spacing={8}
      padding={8}
      cornerRadius={12}
      overflow="visible"
      effect={shadow}
    >
      {/* 헤더 */}
      <AutoLayout
        direction="horizontal"
        horizontalAlignItems="center"
        width={"fill-parent"}
        height={"hug-contents"}
        hoverStyle={{ opacity: 0.7 }}
      >
        <AutoLayout
          width={"fill-parent"}
          height={40}
          onClick={() => setCollapsed(!collapsed)}
        />

        <AutoLayout
          direction="horizontal"
          spacing={12}
          padding={{ top: 4, right: 8 }}
        >
          {[
            {
              text: "briefed",
              state: briefed,
              setState: setBriefed,
              color: "#BDE3FF",
            },
            {
              text: "designed",
              state: designed,
              setState: setDesigned,
              color: "#FFA198",
            },
            {
              text: "built",
              state: built,
              setState: setBuilt,
              color: "#FFE8A3",
            },
            { text: "done", state: done, setState: setDone, color: "#AFF4C6" },
          ].map((status) => (
            <AutoLayout
              direction="vertical"
              spacing={6}
              horizontalAlignItems="center"
            >
              <Text fontSize={10}>{status.text}</Text>
              <Rectangle
                width={18}
                height={18}
                effect={toggleButtonShadow}
                onClick={() => {
                  status.setState(!status.state);
                }}
                fill={status.state ? status.color : "#ffffff"}
                cornerRadius={4}
              />
            </AutoLayout>
          ))}
        </AutoLayout>
      </AutoLayout>

      <AutoLayout
        direction="vertical"
        width={"fill-parent"}
        spacing={8}
      >
        <AutoLayout direction="vertical" width={"fill-parent"} spacing={4}>
          <Text fontSize={12}>Page Title:</Text>
          <Input
            fontSize={14}
            value={pageTitle}
            onTextEditEnd={(e) => {
              setPageTitle(e.characters);
            }}
            inputFrameProps={{
              fill: "#FFFFFF",
              stroke: "#cecece",
              strokeWidth: 1,
              padding: { horizontal: 12, vertical: 8 },
              cornerRadius: 6,
            }}
          />
        </AutoLayout>
        <AutoLayout direction="vertical" width={"fill-parent"} spacing={4}>
          <Text fontSize={12}>URL:</Text>
          <Input
            fontSize={14}
            value={url}
            onTextEditEnd={(e) => {
              setUrl(e.characters);
            }}
            inputFrameProps={{
              fill: "#FFFFFF",
              stroke: "#cecece",
              strokeWidth: 1,
              padding: { horizontal: 12, vertical: 8 },
              cornerRadius: 6,
            }}
          />
        </AutoLayout>
      </AutoLayout>

      <Input
        width={"fill-parent"}
        placeholder="내용"
        value={mainContentText}
        fontSize={24}
        fontWeight={600}
        lineHeight={32}
        onTextEditEnd={(e) => setMainContentText(e.characters)}
        inputBehavior="multiline"
        inputFrameProps={{
          fill: "#FFFFFF",
          stroke: "#cecece",
          strokeWidth: 1,
          padding: { horizontal: 16, vertical: 24 },
          cornerRadius: 12,
        }}
      />

      {/* 토글 테이블 */}
      <AutoLayout
        direction="vertical"
        width={"fill-parent"}
        fill={"#cecece"}
        verticalAlignItems={"center"}
        padding={1}
        spacing={1}
        hidden={collapsed}
        cornerRadius={8}
        overflow="hidden"
      >
        {/* Linked From / Linked To fields */}
        <AutoLayout
          direction="horizontal"
          width={"fill-parent"}
          spacing={1}
        >
          <AutoLayout direction="vertical" width={"fill-parent"} spacing={4} fill="#FFFFFF" padding={12}>
            <Text fontSize={12} fontWeight={600}>Linked From:</Text>
            <Input
              fontSize={14}
              value={linkedFrom}
              onTextEditEnd={(e) => {
                setLinkedFrom(e.characters);
              }}
              inputBehavior="multiline"
              width={"fill-parent"}
              inputFrameProps={{
                fill: "#FFFFFF",
                padding: { horizontal: 8, vertical: 4 },
              }}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width={"fill-parent"} spacing={4} fill="#FFFFFF" padding={12}>
            <Text fontSize={12} fontWeight={600}>Linked To:</Text>
            <Input
              fontSize={14}
              value={linkedTo}
              onTextEditEnd={(e) => {
                setLinkedTo(e.characters);
              }}
              inputBehavior="multiline"
              width={"fill-parent"}
              inputFrameProps={{
                fill: "#FFFFFF",
                padding: { horizontal: 8, vertical: 4 },
              }}
            />
          </AutoLayout>
        </AutoLayout>

        {rowKeys.map((rowKey) => {
          const rowContent = rows.get(rowKey) ?? "";
          const rowColor = rowColors.get(rowKey) ?? colors[0];
          return (
            <AutoLayout
              key={rowKey}
              direction="horizontal"
              width={"fill-parent"}
              verticalAlignItems="center"
              spacing={1}
            >
              {/* Color picker button */}
              <AutoLayout
                direction="vertical"
                spacing={4}
                padding={8}
                fill={rowColor}
                verticalAlignItems="center"
                horizontalAlignItems="center"
              >
                {colors.map((colorOption) => (
                  <Rectangle
                    key={colorOption}
                    width={24}
                    height={24}
                    fill={colorOption}
                    cornerRadius={4}
                    stroke={rowColor === colorOption ? "#333333" : "#CCCCCC"}
                    strokeWidth={rowColor === colorOption ? 2 : 1}
                    onClick={() => rowColors.set(rowKey, colorOption)}
                    hoverStyle={{ opacity: 0.8 }}
                  />
                ))}
              </AutoLayout>

              {/* Row content */}
              <AutoLayout
                width={"fill-parent"}
                fill={rowColor}
                verticalAlignItems="center"
              >
                <Input
                  value={rowContent}
                  onTextEditEnd={(e) => rows.set(rowKey, e.characters)}
                  inputBehavior="multiline"
                  width={"fill-parent"}
                  height={"hug-contents"}
                  inputFrameProps={{
                    fill: rowColor,
                    padding: { horizontal: 16, vertical: 12, right: 0 },
                  }}
                />
                {/* Delete button */}
                <AutoLayout
                  padding={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  fill={rowColor}
                >
                  <SVG
                    src={`<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4 4L12 12" stroke="#333333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      `}
                    opacity={0}
                    hoverStyle={{ opacity: 1 }}
                    onClick={() => deleteRow(rowKey)}
                  />
                </AutoLayout>
              </AutoLayout>
            </AutoLayout>
          );
        })}
      </AutoLayout>

      {/* '행 추가' 버튼 */}
      <AutoLayout
        hidden={collapsed}
        width={"fill-parent"}
        height={40}
        fill={color}
        opacity={0}
        hoverStyle={{ fill: "#585858", opacity: 1 }}
        cornerRadius={20}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        onClick={addRow}
      >
        <Text fontSize={12} fill={"#FFFFFF"}>
          행 추가
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(CollapsibleTaskCard);
