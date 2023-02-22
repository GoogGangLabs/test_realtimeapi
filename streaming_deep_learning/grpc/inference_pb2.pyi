from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class InferenceResponse(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class StreamRequest(_message.Message):
    __slots__ = ["frame", "sequence", "sessionId", "startedAt", "step", "timestamp"]
    FRAME_FIELD_NUMBER: _ClassVar[int]
    SEQUENCE_FIELD_NUMBER: _ClassVar[int]
    SESSIONID_FIELD_NUMBER: _ClassVar[int]
    STARTEDAT_FIELD_NUMBER: _ClassVar[int]
    STEP_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    frame: _containers.RepeatedScalarFieldContainer[bytes]
    sequence: int
    sessionId: str
    startedAt: int
    step: _containers.RepeatedScalarFieldContainer[int]
    timestamp: _containers.RepeatedScalarFieldContainer[int]
    def __init__(self, sessionId: _Optional[str] = ..., sequence: _Optional[int] = ..., startedAt: _Optional[int] = ..., frame: _Optional[_Iterable[bytes]] = ..., timestamp: _Optional[_Iterable[int]] = ..., step: _Optional[_Iterable[int]] = ...) -> None: ...
