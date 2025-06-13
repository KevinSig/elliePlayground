'use client';

//https://github.com/Aslam97/react-fancy-switch

import * as React from 'react';
import { cn } from '@/lib/utils';

export type OptionValue = string | number | boolean;

export interface OptionObject {
	[key: string]: OptionValue | undefined;
}

export type OptionType = OptionValue | OptionObject;

export interface FancySwitchProps<T extends OptionType>
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
	value?: T extends OptionObject ? T[keyof T] : T;
	onChange?: (value: T extends OptionObject ? T[keyof T] : T) => void;
	options: T[];
	valueKey?: keyof T & string;
	labelKey?: keyof T & string;
	disabledKey?: keyof T & string;
	radioClassName?: string;
	highlighterClassName?: string;
	highlighterStyle?: React.CSSProperties;
	disabledOptions?: Array<T extends OptionObject ? T[keyof T] : T>;
	renderOption?: (props: {
		option: T extends OptionObject
			? T & { label: string; value: OptionValue; disabled: boolean }
			: { label: string; value: T; disabled: boolean };
		isSelected: boolean;
		getOptionProps: () => Record<string, string | boolean | OptionValue>;
	}) => React.ReactNode;
}


export function FancySwitch<T extends OptionType>({
	value,
	onChange,
	options,
	valueKey = 'value' as keyof T & string,
	labelKey = 'label' as keyof T & string,
	disabledKey = 'disabled' as keyof T & string,
	radioClassName,
	highlighterClassName,
	highlighterStyle: customHighlighterStyle,
	disabledOptions = [],
	renderOption,
	className,
	...props
}: FancySwitchProps<T>) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [highlighterStyleState, setHighlighterStyleState] =
		React.useState<React.CSSProperties>({});
	const [isInitialized, setIsInitialized] = React.useState(false);

	// Helper function to get option value
	const getOptionValue = React.useCallback(
		(option: T): OptionValue => {
			if (typeof option === 'object' && option !== null) {
				const value = (option as OptionObject)[valueKey];
				return value !== undefined ? value : String(option);
			}
			return option as OptionValue;
		},
		[valueKey],
	);

	// Helper function to get option label
	const getOptionLabel = React.useCallback(
		(option: T): string => {
			if (typeof option === 'object' && option !== null) {
				const label = (option as OptionObject)[labelKey];
				return label?.toString() ?? getOptionValue(option).toString();
			}
			return option?.toString() ?? '';
		},
		[labelKey, getOptionValue],
	);

	// Helper function to check if option is disabled
	const isOptionDisabled = React.useCallback(
		(option: T): boolean => {
			const optionValue = getOptionValue(option);

			// Check in disabledOptions array
			if (disabledOptions.some(disabled => disabled === optionValue)) {
				return true;
			}

			// Check object property if it's an object
			if (typeof option === 'object' && option !== null) {
				const disabled = (option as OptionObject)[disabledKey];
				return Boolean(disabled);
			}

			return false;
		},
		[disabledOptions, disabledKey, getOptionValue],
	);

	// Find selected index
	const selectedIndex = React.useMemo(() => {
		const index = options.findIndex(
			(option) => getOptionValue(option) === value,
		);
		return index >= 0 ? index : 0;
	}, [options, value, getOptionValue]);

	// Update highlighter position
	const updateHighlighter = React.useCallback(() => {
		if (!containerRef.current) return;

		const container = containerRef.current;
		// Skip the first child (highlighter) and get the actual button
		const selectedElement = container.children[
			selectedIndex + 1
		] as HTMLElement;

		if (!selectedElement) return;

		const containerRect = container.getBoundingClientRect();
		const selectedRect = selectedElement.getBoundingClientRect();

		const left = selectedRect.left - containerRect.left;
		const width = selectedRect.width;
		const height = selectedRect.height;
		const top = selectedRect.top - containerRect.top;

		const newStyle: React.CSSProperties = {
			position: 'absolute',
			left: left,
			top: top,
			width: width,
			height: height,
			transition: isInitialized
				? 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
				: 'none',
			pointerEvents: 'none',
			zIndex: 1,
			...customHighlighterStyle,
		};

		setHighlighterStyleState(newStyle);

		if (!isInitialized) {
			// Delay initialization to ensure proper first render
			setTimeout(() => setIsInitialized(true), 50);
		}
	}, [selectedIndex, customHighlighterStyle, isInitialized]);

	// Update highlighter on mount and when dependencies change
	React.useEffect(() => {
		// Use requestAnimationFrame to ensure DOM is ready
		const updateWithDelay = () => {
			requestAnimationFrame(() => {
				updateHighlighter();
			});
		};

		updateWithDelay();

		const resizeObserver = new ResizeObserver(updateWithDelay);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [selectedIndex, options, value, updateHighlighter]);

	// Ensure highlighter is positioned correctly on initial render
	React.useEffect(() => {
		if (containerRef.current && !isInitialized) {
			const timer = setTimeout(() => {
				updateHighlighter();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [updateHighlighter, isInitialized]);

	// Handle option selection
	const handleOptionSelect = React.useCallback(
		(option: T) => {
			if (isOptionDisabled(option)) return;

			const optionValue = getOptionValue(option);
			onChange?.(optionValue as T extends OptionObject ? T[keyof T] : T);
		},
		[onChange, getOptionValue, isOptionDisabled],
	);

	// Handle keyboard navigation
	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent, option: T) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleOptionSelect(option);
			}
		},
		[handleOptionSelect],
	);

	return (
		<div
			ref={containerRef}
			className={cn(
				'relative inline-flex items-center rounded-full bg-teal-100 p-0.5',
				className,
			)}
			role='radiogroup'
			{...props}
		>
			{/* Highlighter */}
			<div
				className={cn('rounded-full border-teal-400 bg-teal-400', highlighterClassName)}
				style={highlighterStyleState}
				aria-hidden='true'
			/>

			{/* Options */}
			{options.map((option, index) => {
				const optionValue = getOptionValue(option);
				const optionLabel = getOptionLabel(option);
				const isSelected = optionValue === value;
				const isDisabled = isOptionDisabled(option);

				const getOptionProps = () => ({
					'data-value': optionValue,
					'data-selected': isSelected,
					'data-disabled': isDisabled,
				});

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const optionProps: any = {
					option:
						typeof option === 'object' && option !== null
							? {
									...(option as OptionObject),
									label: optionLabel,
									value: optionValue,
									disabled: isDisabled,
								}
							: { label: optionLabel, value: option, disabled: isDisabled },
					isSelected,
					getOptionProps,
				};

				if (renderOption) {
					return (
						<div
							key={index}
							className={cn(
								'relative z-10 cursor-pointer',
								isDisabled && 'cursor-not-allowed',
							)}
							onClick={() => handleOptionSelect(option)}
						>
							{renderOption(optionProps)}
						</div>
					);
				}

				return (
					<button
						key={index}
						type='button'
						role='radio'
						aria-checked={isSelected}
						aria-disabled={isDisabled}
						disabled={isDisabled}
						className={cn(
							'relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all',
							'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2',
							'disabled:pointer-events-none disabled:opacity-50',
							isSelected
								? 'text-white'
								: 'text-teal-400 hover:text-teal-600 hover:bg-teal-200/50',
							radioClassName,
						)}
						onClick={() => handleOptionSelect(option)}
						onKeyDown={(e) => handleKeyDown(e, option)}
						{...getOptionProps()}
					>
						{optionLabel}
					</button>
				);
			})}
		</div>
	);
}

FancySwitch.displayName = 'FancySwitch';

export default FancySwitch;
