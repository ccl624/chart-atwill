export interface PieTitle {
  show?: boolean; // 是否展示title
  position?: string[]; // ['50%', '45%']
  value?: string;
}

export interface PieLegend {
  type?: string;
  orient?: string;
  bottom?: number;
  data: string[];
}

export interface PieTooltip {
  formatter: any;
}

export interface Label {
  show?: boolean;
  borderWidth?: number;
  background?: string;
  borderColor?: string;
}

export interface SeriesDataItem {
  name: string;
  value: string;
  selected?: boolean;
  percent: string;
}

export interface SfPieSeriesItem {
  radius: string[]; // ['50%', '45%']
  center: string[]; // ['50%', '45%']
  borderWidth: number;
  label: Label;
  data: any[];
}

export interface SfPieOption {
  id?: string;
  color?: string[];
  title?: PieTitle;
  legend?: PieLegend;
  tooltip?: PieTooltip;
  series: SfPieSeriesItem[];
}
