export type ResponseHandler = <ResponseShape>(response?: ResponseShape) => Promise<ResponseShape | void> | ResponseShape | void;
export type FetcherOptions = {
    after?: ResponseHandler[];
    array?: true;
    base?: string | URL;
    encode?: false;
    fetch?: typeof fetch;
    parse?: false | 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
    query?: Record<string, any>;
} & RequestInit;
export type GetFetchCall<DefaultResponseShape = any> = {
    <ResponseShape = DefaultResponseShape>(url?: string, options?: FetcherOptions): Promise<ResponseShape>;
    <ResponseShape = DefaultResponseShape>(options?: FetcherOptions): Promise<ResponseShape>;
};
export type FetchCall<DefaultRequestShape = any, DefaultResponseShape = any> = {
    (url?: string, payload?: undefined | DefaultRequestShape, options?: FetcherOptions): Promise<DefaultResponseShape>;
    (payload?: any, options?: FetcherOptions): Promise<DefaultResponseShape>;
    <RequestShape = DefaultRequestShape>(url: string, payload: RequestShape, options?: FetcherOptions): Promise<DefaultResponseShape>;
    <RequestShape = DefaultRequestShape>(payload: RequestShape, options?: FetcherOptions): Promise<DefaultResponseShape>;
    <RequestShape = DefaultRequestShape, ResponseShape = DefaultResponseShape>(url: string, payload: RequestShape, options?: FetcherOptions): Promise<ResponseShape>;
    <RequestShape = DefaultRequestShape, ResponseShape = DefaultResponseShape>(payload: RequestShape, options?: FetcherOptions): Promise<ResponseShape>;
    <ResponseShape = DefaultResponseShape>(url?: string, payload?: undefined, options?: FetcherOptions): Promise<ResponseShape>;
};
export type Fetcher<DefaultRequestShape = any, DefaultResponseShape = any> = {
    get: GetFetchCall<DefaultResponseShape>;
    post: FetchCall<DefaultRequestShape, DefaultResponseShape>;
    put: FetchCall<DefaultRequestShape, DefaultResponseShape>;
    patch: FetchCall<DefaultRequestShape, DefaultResponseShape>;
    delete: FetchCall<DefaultRequestShape, DefaultResponseShape>;
};
export type FetcherFactory = <DefaultRequestShape = any, DefaultResponseShape = any>(optionsOrBaseUrl?: string | FetcherOptions, additionalOptions?: FetcherOptions) => Fetcher<DefaultRequestShape, DefaultResponseShape>;
